
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * 외부 URL에서 이미지를 다운로드하여 public/uploads 폴더에 저장합니다.
 * @param url 대상 URL
 * @param cache (선택) 동일 세션 내 중복 다운로드 방지를 위한 캐시 객체
 */
export async function downloadExternalImage(url: string, cache?: Map<string, string>): Promise<string | null> {
    try {
        // 1. URL이 이미 로컬 경로인 경우 건너뜜
        if (url.startsWith('/uploads/') || !url.startsWith('http')) {
            return url;
        }

        // 2. 캐시 확인 (동일한 URL을 이미 이번 세션에 받았다면 재사용)
        if (cache && cache.has(url)) {
            console.log(`[ImageSync] Using cached path for: ${url}`);
            return cache.get(url) || null;
        }

        console.log(`[ImageSync] Downloading: ${url}`);

        // [High-res Fix] Google Drive/UserContent URL인 경우 해상도 제한 파라미터가 있다면 원본으로 변경 시도
        let targetUrl = url;
        if (url.includes('googleusercontent.com') || url.includes('drive-viewer')) {
            // =s300, =w300-h300 등을 =s0 (원본)으로 변경하거나 제거
            targetUrl = url.replace(/=s\d+/, '=s0').replace(/=w\d+-h\d+/, '=s0');
            if (targetUrl !== url) {
                console.log(`[ImageSync] URL converted to high-res: ${targetUrl}`);
            }
        }

        // 2. 이미지 데이터 가져오기
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.error(`[ImageSync] Failed to fetch: ${url} (Status: ${response.status})`);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3. 저장소 준비
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Directory might already exist
        }

        // 4. 고유 파일명 생성 (확장자 추출 시도)
        const urlPath = new URL(url).pathname;
        const ext = urlPath.split('.').pop()?.toLowerCase() || 'jpg';
        const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'png'].includes(ext) ? ext : 'jpg';
        const filename = `${uuidv4()}.${safeExt}`;
        const filepath = join(uploadDir, filename);

        // 5. 파일 쓰기
        await writeFile(filepath, buffer);
        const savedPath = `/uploads/${filename}`;
        console.log(`[ImageSync] Saved to: ${savedPath}`);

        // 캐시에 저장
        if (cache) {
            cache.set(url, savedPath);
        }

        return savedPath;
    } catch (error) {
        console.error(`[ImageSync] Error downloading image ${url}:`, error);
        return null;
    }
}
