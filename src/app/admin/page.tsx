
export default function AdminDashboard() {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">대시보드</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition">
                    <h3 className="text-lg font-semibold mb-2">사업 분야</h3>
                    <p className="text-3xl font-bold text-primary">4</p>
                    <p className="text-sm text-gray-500 mt-2">관리 중인 사업부</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition">
                    <h3 className="text-lg font-semibold mb-2">등록된 상품</h3>
                    <p className="text-3xl font-bold text-secondary">0</p>
                    <p className="text-sm text-gray-500 mt-2">전체 상품 수</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition">
                    <h3 className="text-lg font-semibold mb-2">카테고리</h3>
                    <p className="text-3xl font-bold text-indigo-600">0</p>
                    <p className="text-sm text-gray-500 mt-2">제품 카테고리</p>
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">빠른 작업</h3>
                <div className="flex gap-4">
                    {/* Add buttons later */}
                    <p className="text-gray-500">좌측 메뉴를 통해 관리를 시작하세요.</p>
                </div>
            </div>
        </div>
    )
}
