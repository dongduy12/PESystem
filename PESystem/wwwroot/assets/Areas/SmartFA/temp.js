$(document).ready(function () {
    if (typeof StatusManager !== 'undefined' && $.fn.autocomplete) {
        StatusManager.setup();
        console.log('StatusManager đã khởi tạo thành công');
    } else {
        console.error('Lỗi: jQuery UI hoặc StatusManager không khả dụng');
    }
});

const StatusManager = (function () {
    let errorCodeCache = []; // Lưu cache danh sách error codes

    function setupEventListeners() {
        $('.btn-fa, .btn-retest, .btn-vi, .btn-thay-lieu, .btn-check-list').on('click', handleBulkStatusUpdate);
        $('#btn-retest-status-update').on('click', handleRetestStatusUpdate);
        // ... (các sự kiện khác)
    }

    function setupErrorCodeAutocomplete() {
        if ($.fn.autocomplete) {
            $('#error-code-input').autocomplete({
                source: async function (request, response) {
                    try {
                        // Lấy dữ liệu từ cache nếu đã tải, nếu không thì gọi API
                        if (errorCodeCache.length === 0) {
                            const data = await ApiService.getErrorCodes();
                            console.log('Dữ liệu từ API:', data);
                            if (!data.success || !data.errorCodes || !Array.isArray(data.errorCodes)) {
                                throw new Error('Dữ liệu API không hợp lệ');
                            }
                            errorCodeCache = data.errorCodes.map(item => ({
                                label: `${item.ERROR_CODE} - ${item.ERROR_DESC || 'Không có mô tả'}`,
                                value: item.ERROR_CODE,
                                desc: item.ERROR_DESC || 'Không có mô tả'
                            }));
                        }

                        // Lọc danh sách dựa trên chuỗi nhập vào (tìm kiếm gần đúng)
                        const term = request.term.toLowerCase();
                        const filteredCodes = errorCodeCache.filter(item =>
                            item.label.toLowerCase().includes(term) ||
                            item.value.toLowerCase().includes(term)
                        );
                        console.log('Danh sách gợi ý sau khi lọc:', filteredCodes);

                        if (filteredCodes.length === 0) {
                            showWarning('Không tìm thấy mã lỗi nào!');
                        }
                        response(filteredCodes);
                    } catch (error) {
                        console.error('Lỗi autocomplete:', error);
                        showError('Không thể tải danh sách mã lỗi: ' + error.message);
                        response([]);
                    }
                },
                minLength: 1, // Giảm xuống 1 ký tự để tìm kiếm nhanh hơn
                select: function (event, ui) {
                    $('#error-code-input').val(ui.item.value);
                    $('#error-desc-display').text(ui.item.desc);
                    return false;
                },
                open: function () {
                    $(this).removeClass('ui-corner-all').addClass('ui-corner-top');
                    console.log('Autocomplete mở');
                },
                close: function () {
                    $(this).removeClass('ui-corner-top').addClass('ui-corner-all');
                    console.log('Autocomplete đóng');
                }
            }).autocomplete("instance")._renderItem = function (ul, item) {
                return $("<li>")
                    .append("<div>" + item.label + "</div>")
                    .appendTo(ul);
            };
        } else {
            console.error('jQuery UI autocomplete không khả dụng');
        }
    }

    async function handleBulkStatusUpdate() {
        const serialNumbers = DataTableManager.getAllSerialNumbers();
        if (serialNumbers.length === 0) {
            showWarning('Không có SN để cập nhật trạng thái!');
            return;
        }

        if ($(this).hasClass('btn-retest')) {
            ModalManager.showModal('#modal-retest');
            $('#select-retest-result').val('');
            $('#select-retest-status').val('');
            $('#error-code-input').val('');
            $('#error-desc-display').text('');
            setupErrorCodeAutocomplete();
        }
        // ... (các xử lý khác)
    }

    async function handleRetestStatusUpdate() {
        const selectedStatus = $('#select-retest-status').val();
        const selectedTestResult = $('#select-retest-result').val();
        const errorCode = $('#error-code-input').val().trim();
        // ... (các xử lý khác)
    }

    return {
        setup: setupEventListeners
    };
})();