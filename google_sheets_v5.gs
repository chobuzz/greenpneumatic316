/**
 * 구글 스프레드시트 통합 엔진 v5.0 (최종 통합 버전)
 * 기능: 
 *   - [New] 전 엔터티 CRUD (사업부, 상품, 카테고리, 인사이트 등)
 *   - [New] 상담문의 및 견적내역 마케팅 동의 데이터 연동
 *   - [Legacy] 전자장부 데이터 매핑 및 고객 관리
 *   - [Legacy] 현대적 디자인의 자동 이메일 발송 배치
 */

// --- [설정 영역] ---
const MASTER_SHEET_NAME = "MasterList";
const SETTINGS_SHEET_NAME = "EmailSettings";
const UNSUBSCRIBE_SHEET_NAME = "Unsubscribed";
const SOURCE_SHEETS = ["고객관리_파워에어", "고객관리_베큠투제로", "고객관리_탱크나라", "고객관리_그린뉴메틱"];
const SITE_URL = "https://greenpneumatic.com";

// 핵심 컬럼명 (고객관리용)
const COL_NAME = "거래처명"; 
const COL_EMAIL = "이메일";
const COL_MANAGER = "담당자";
const COL_PHONE = "핸드폰";

const BATCH_SIZE = 15; 
const RESET_DAYS = 180; 
// ------------------

/**
 * 1. 데이터 저장 및 관리 (POST)
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action; // 'create', 'update', 'delete', 'sync'
    const type = payload.type;     // 'businessUnit', 'category', 'product', 'insight', 'quotation', 'inquiry', 'customers'
    const data = payload.data || payload; 
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const timestamp = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");

    // A. [New] 신규 CRUD 엔진 (action이 명시된 경우)
    if (action) {
      return handleCrudAction(ss, action, type, data);
    }

    // B. [Legacy] 기존 방식 호환 (action이 없는 경우)
    if (type === 'customers') {
      const source = data.source || SOURCE_SHEETS[0];
      var realSource = SOURCE_SHEETS.find(s => s.includes(source)) || source;
      const sheet = ss.getSheetByName(realSource) || ss.insertSheet(realSource);
      const items = Array.isArray(data.items) ? data.items : [data];
      let addedCount = 0;
      items.forEach(item => { if (upsertCustomer(sheet, item)) addedCount++; });
      return jsonResponse({ result: "success", added: addedCount });
    }

    const isQuote = type === 'quotation';
    const sheet = getOrCreateSheet(ss, type);

    if (sheet.getLastRow() === 0) {
      const headers = isQuote 
        ? ["발생일시", "고객명", "업체명", "연락처", "이메일", "상품명", "모델명", "수량", "총금액", "사업부", "마케팅동의", "ID"]
        : (type === 'inquiry' ? ["발생일시", "성함", "업체명", "연락처", "이메일", "문의구분", "상세내용", "마케팅동의", "ID"] : []);
      if (headers.length > 0) sheet.appendRow(headers);
    }

    if (type === 'emailSettings') {
      saveSettings(ss, data);
    } else if (isQuote) {
      sheet.appendRow([timestamp, data.customerName, data.company || "-", data.phone, data.email, data.productName, data.modelName, data.quantity, data.totalPrice, data.unitName, data.마케팅동의, data.id]);
    } else if (type === 'inquiry') {
      sheet.appendRow([timestamp, data.name, data.company || "-", data.phone, data.email, data.subject, data.message, data.마케팅동의, data.id]);
    }
    
    return jsonResponse({ result: "success" });
  } catch (err) {
    return jsonResponse({ result: "error", message: err.toString() });
  }
}

/**
 * 2. 데이터 불러오기 (GET)
 */
function doGet(e) {
  try {
    const type = e.parameter.type;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // A. 고객관리 (복합 시트 매핑)
    if (type === 'customers') {
      const allCustomers = [];
      const labels = [
        "장부번호", "장부명", COL_NAME, "사업번호", "종사업장", "법인등록번호", 
        "대표자", "사업주소", "업태", "종목", "우편번호", "실제주소1", "실제주소2", 
        "전화1", "전화2", "팩스", COL_MANAGER, COL_PHONE, COL_EMAIL, "이메일2", 
        "홈페이지", "거래구분", "트리구분", "비고", "관련계정", "분류명", 
        "영업담당자", "보고서출력여부", "잔액", "매출가격", "SMS발송", "FAX발송", 
        "부가세처리관행", "자동범주", "이월기초잔액", "은행명", "계좌번호", "예금주", "정률"
      ];

      SOURCE_SHEETS.forEach(sName => {
        const sheet = ss.getSheetByName(sName);
        if (!sheet) return;
        const data = sheet.getDataRange().getValues();
        if (data.length < 2) return;
        
        const headers = data[0];
        const idx = getIndices(headers, labels);
        
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          const email = row[idx[COL_EMAIL]];
          if (!email) continue;
          
          const customer = { id: (row[idx["장부번호"]] || sName) + "_" + i, source: sName.replace('고객관리_', '') };
          const engKeys = [
            "ledgerNo", "ledgerName", "name", "businessNo", "subBusinessNo", "corporationNo",
            "ceo", "address", "businessType", "category", "zipCode", "address1", "address2",
            "phone1", "phone2", "fax", "manager", "phone", "email", "email2",
            "homepage", "tradeType", "treeType", "remark", "relatedAccount", "className",
            "salesManager", "reportOutput", "balance", "salesPrice", "smsOptIn", "faxOptIn",
            "vatPractice", "autoCategory", "initialBalance", "bankName", "bankAccount", "accountHolder", "fixedRate"
          ];
          engKeys.forEach((key, kIdx) => { customer[key] = row[idx[labels[kIdx]]] || ""; });
          allCustomers.push(customer);
        }
      });
      return jsonResponse(allCustomers);
    }
    
    // B. 이메일 설정 (단일 행 처리)
    if (type === 'emailSettings') {
        const settings = getSettings(ss);
        return jsonResponse(settings ? [settings] : []);
    }

    // C. 기타 모바일/웹 데이터 (인사이트, 상품, 카테고리 등)
    const sheetName = getMapSheetName(type);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 1) return jsonResponse([]);
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const results = [];
    
    for (let i = 1; i < data.length; i++) {
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        const val = data[i][j];
        // JSON 문자열 자동 파싱 시도 (배열 데이터 등)
        if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
           try { obj[headers[j]] = JSON.parse(val); } catch(e) { obj[headers[j]] = val; }
        } else {
           obj[headers[j]] = val;
        }
      }
      results.push(obj);
    }
    
    return jsonResponse(results);
  } catch (err) {
    return jsonResponse({ result: "error", message: err.toString() });
  }
}

/**
 * 3. 통합 CRUD 핸들러
 */
function handleCrudAction(ss, action, type, data) {
  const sheet = getOrCreateSheet(ss, type);
  
  if (action === 'sync') {
    sheet.clear();
    if (data && data.length > 0) {
      const headers = Object.keys(data[0]);
      sheet.appendRow(headers);
      data.forEach(item => {
        sheet.appendRow(headers.map(h => typeof item[h] === 'object' ? JSON.stringify(item[h]) : (item[h] || "")));
      });
    }
    return jsonResponse({result: "success", message: "Synced " + (data ? data.length : 0) + " items"});
  }

  if (type === 'emailSettings') {
      saveSettings(ss, data);
      return jsonResponse({result: "success"});
  }

  if (action === 'delete') {
    const id = data.id;
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] == id) {
        sheet.deleteRow(i + 1);
        return jsonResponse({result: "success"});
      }
    }
    return jsonResponse({result: "error", message: "ID not found"});
  }

  if (action === 'update') {
    const id = data.id;
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] == id) {
        const newRow = headers.map(h => {
          const val = data[h] !== undefined ? data[h] : rows[i][headers.indexOf(h)];
          return typeof val === 'object' ? JSON.stringify(val) : val;
        });
        sheet.getRange(i + 1, 1, 1, newRow.length).setValues([newRow]);
        return jsonResponse({result: "success"});
      }
    }
    return jsonResponse({result: "error", message: "ID not found"});
  }

  // 기본: Append (Create)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(Object.keys(data));
  }
  const currentHeaders = sheet.getDataRange().getValues()[0];
  const rowData = currentHeaders.map(h => {
    const val = data[h] !== undefined ? data[h] : "";
    return typeof val === 'object' ? JSON.stringify(val) : val;
  });
  sheet.appendRow(rowData);
  return jsonResponse({result: "success"});
}

/**
 * 4. 자동 메일 발송 및 템플릿 엔진
 */
function dailyBatchEmailJob() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = getSettings(ss);
  if (!settings) return;
  const unsubscribed = getUnsubscribed(ss);
  updateMasterList(ss); 
  const masterSheet = ss.getSheetByName(MASTER_SHEET_NAME);
  const data = masterSheet.getDataRange().getValues();
  data.shift();
  const now = new Date();
  const targets = [];
  for (let i = 0; i < data.length; i++) {
    const [email, name, source, lastSent] = data[i];
    if (unsubscribed.indexOf(email) !== -1 || !email) continue;
    const lastSentDate = lastSent ? new Date(lastSent) : null;
    if (!lastSentDate || (now - lastSentDate) / (1000 * 60 * 60 * 24) >= RESET_DAYS) {
      targets.push({ index: i + 2, email, name });
      if (targets.length >= BATCH_SIZE) break;
    }
  }
  targets.forEach(t => {
    try {
      let subject = settings.subject.replace(/{name}/g, t.name);
      if (settings.isAd) subject = "(광고) " + subject;
      const htmlBody = getModernHtmlTemplate({ body: settings.body, recipientName: t.name, senderAddress: settings.address, senderPhone: settings.phone });
      MailApp.sendEmail({ to: t.email, subject: subject, body: settings.body.replace(/<[^>]*>?/gm, ''), htmlBody: htmlBody });
      masterSheet.getRange(t.index, 4).setValue(new Date());
    } catch (e) { console.error(e); }
  });
}

/**
 * [테스트 전용] 자동화 이메일 발송 테스트 함수
 * Apps Script 에디터에서 직접 실행하면 아래 두 주소로 발송됩니다.
 * MasterList/수신거부 목록은 무시하고, 이메일 템플릿과 설정만 검증합니다.
 */
function testBatchEmailJob() {
  const TEST_TARGETS = [
    { email: "vacuumtozero@gmail.com", name: "테스트 수신자 A" },
    { email: "poweraircomp@naver.com", name: "테스트 수신자 B" }
  ];

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = getSettings(ss);

  if (!settings) {
    Logger.log("❌ 이메일 설정(EmailSettings 시트)이 없습니다. 먼저 설정을 저장해 주세요.");
    return;
  }

  Logger.log("📧 테스트 메일 발송 시작 (" + TEST_TARGETS.length + "건)");

  TEST_TARGETS.forEach(function(t) {
    try {
      let subject = "[테스트] " + settings.subject.replace(/{name}/g, t.name);
      if (settings.isAd) subject = "(광고) " + subject;

      const htmlBody = getModernHtmlTemplate({
        body: settings.body,
        recipientName: t.name,
        senderAddress: settings.address,
        senderPhone: settings.phone
      });

      MailApp.sendEmail({
        to: t.email,
        subject: subject,
        body: settings.body.replace(/<[^>]*>?/gm, ''),
        htmlBody: htmlBody
      });

      Logger.log("✅ 발송 완료 → " + t.email);
    } catch (e) {
      Logger.log("❌ 발송 실패 (" + t.email + "): " + e.toString());
    }
  });

  Logger.log("🎉 테스트 발송 완료! Apps Script 실행 로그를 확인하세요.");
}

function getModernHtmlTemplate({ body, recipientName, senderAddress, senderPhone }) {
  let processedBody = body.replace(/\{name\}/g, recipientName || '고객');
  processedBody = processedBody.replace(/<img([^>]*)src="([^"]*)"([^>]*)>/gi, function(match, p1, p2, p3) {
      let src = p2;
      if (src.startsWith('/uploads/')) src = SITE_URL + src;
      return '<img' + p1 + 'src="' + src + '"' + p3 + ' style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin: 16px 0; display: block;">';
  });
  if (!processedBody.includes('<p>') && !processedBody.includes('<div>')) processedBody = processedBody.replace(/\n/g, '<br>');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif;"><table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f1f5f9;"><tr><td align="center" style="padding: 40px 10px;"><table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05);"><tr><td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 50px 40px; text-align: center;"><div style="background-color: rgba(255,255,255,0.15); display: inline-block; padding: 6px 14px; border-radius: 100px; margin-bottom: 20px;"><span style="color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 2px;">Green Pneumatic Solution</span></div><h1 style="margin: 0; color: #ffffff; font-size: 30px; font-weight: 900; letter-spacing: -1px;">그린뉴메틱</h1><p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.85); font-size: 14px;">혁신적인 유체 제어 및 안전 시스템의 파트너</p></td></tr><tr><td style="padding: 50px 40px; background-color: #ffffff;"><div style="color: #1e293b; font-size: 16px; line-height: 1.8;">${processedBody}</div></td></tr><tr><td style="padding: 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;"><table role="presentation" style="width: 100%;"><tr><td style="padding-bottom: 20px;"><p style="margin: 0; color: #0f172a; font-size: 14px; font-weight: 800;">그린뉴메틱 <span style="color: #10b981;">GREEN PNEUMATIC</span></p></td></tr><tr><td style="padding: 15px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;"><p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.8;"><strong style="color: #64748b;">주소:</strong> ${senderAddress || '경기도 양평군 다래길 27'}<br><strong style="color: #64748b;">연락처:</strong> ${senderPhone || '010-7392-9809'}<br><strong style="color: #64748b;">이메일:</strong> greenpneumatic316@gmail.com</p></td></tr><tr><td style="padding-top: 25px; text-align: center;"><p style="margin: 0; color: #94a3b8; font-size: 11px;">본 메일은 관련 규정에 의거하여 수신 동의를 하신 고객님께 발송되었습니다.</p><div style="margin-top: 15px;"><a href="https://greenpneumatic.com/unsubscribe" style="color: #64748b; text-decoration: underline; font-size: 11px; font-weight: 600;">수신거부 (Unsubscribe)</a></div></td></tr></table></td></tr></table></td></tr></table></body></html>`.trim();
}

/**
 * 5. 유틸리티 함수
 */
function getMapSheetName(type) {
  const map = {
    'businessUnit': '사업분야',
    'category': '카테고리',
    'product': '상품관리',
    'insight': '인사이트',
    'emailSettings': SETTINGS_SHEET_NAME,
    'quotation': '견적내역',
    'inquiry': '상담문의',
    'customers': '고객관리'
  };
  return map[type] || type;
}

function getOrCreateSheet(ss, type) {
  const name = getMapSheetName(type);
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function getIndices(headers, labels) {
  const map = {};
  labels.forEach(l => { map[l] = headers.indexOf(l); });
  return map;
}

function upsertCustomer(sheet, item) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailIdx = headers.indexOf(COL_EMAIL);
  if (emailIdx === -1) return false;
  const email = item.email || item[COL_EMAIL];
  const exists = data.some(row => row[emailIdx] === email);
  if (!exists) {
    sheet.appendRow(headers.map(h => (item[h] || item[EnglishToKorean(h)] || "")));
    return true;
  }
  return false;
}

function EnglishToKorean(key) {
  const map = { 
    ledgerNo: "장부번호", ledgerName: "장부명", name: COL_NAME, businessNo: "사업번호", 
    subBusinessNo: "종사업장", corporationNo: "법인등록번호", ceo: "대표자", address: "사업주소", 
    businessType: "업태", category: "종목", zipCode: "우편번호", address1: "실제주소1", 
    address2: "실제주소2", phone1: "전화1", phone2: "전화2", fax: "팩스", 
    manager: COL_MANAGER, phone: COL_PHONE, email: COL_EMAIL, email2: "이메일2"
  };
  return map[key] || key;
}

function saveSettings(ss, data) {
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME) || ss.insertSheet(SETTINGS_SHEET_NAME);
  sheet.clear();
  sheet.appendRow(["subject", "body", "senderAddress", "senderPhone", "isAd"]);
  sheet.appendRow([data.subject, data.body, data.senderAddress, data.senderPhone, data.isAd]);
}

function getSettings(ss) {
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return null;
  const row = sheet.getRange(2, 1, 1, 5).getValues()[0];
  return { subject: row[0], body: row[1], address: row[2], phone: row[3], isAd: row[4] };
}

function getUnsubscribed(ss) {
  const sheet = ss.getSheetByName(UNSUBSCRIBE_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];
  return sheet.getDataRange().getValues().slice(1).map(r => r[0]);
}

function updateMasterList(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  let master = ss.getSheetByName(MASTER_SHEET_NAME) || ss.insertSheet(MASTER_SHEET_NAME);
  if (master.getLastRow() === 0) master.appendRow(["Email", "Name", "Source", "LastSent"]);
  const existing = master.getDataRange().getValues().map(r => r[0]);
  
  // 1. 기존 고객관리 시트
  SOURCE_SHEETS.forEach(sName => {
    const sheet = ss.getSheetByName(sName);
    if (!sheet) return;
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const eIdx = headers.indexOf(COL_EMAIL);
    const nIdx = headers.indexOf(COL_NAME);
    if (eIdx === -1) return;
    data.slice(1).forEach(row => {
      const email = row[eIdx];
      if (email && existing.indexOf(email) === -1) {
        master.appendRow([email, row[nIdx] || "고객", sName, ""]);
        existing.push(email);
      }
    });
  });

  // 2. 상담문의 및 견적내역 (마케팅 동동의시만)
  ["상담문의", "견적내역"].forEach(sName => {
    const sheet = ss.getSheetByName(sName);
    if (!sheet) return;
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const eIdx = headers.indexOf("이메일");
    const nIdx = headers.indexOf(sName === "상담문의" ? "성함" : "고객명");
    const cIdx = headers.indexOf("마케팅동의");
    if (eIdx === -1 || cIdx === -1) return;
    
    data.slice(1).forEach(row => {
      const email = row[eIdx];
      const consent = row[cIdx];
      if (email && consent === "Y" && existing.indexOf(email) === -1) {
        master.appendRow([email, row[nIdx] || "고객", sName, ""]);
        existing.push(email);
      }
    });
  });
}
