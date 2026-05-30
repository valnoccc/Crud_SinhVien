const API_URL = 'https://698591166964f10bf2539592.mockapi.io/SinhVien';
        let dataTable;

        function escapeHtml(value = '') {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function encodeArg(value = '') {
            return encodeURIComponent(String(value || ''));
        }

        function decodeArg(value = '') {
            return decodeURIComponent(value);
        }

        async function loadData() {
            try {
                const res = await fetch(API_URL);
                const data = await res.json();

                if ($.fn.DataTable.isDataTable('#studentTable')) {
                    $('#studentTable').DataTable().destroy();
                }

                const tbody = document.querySelector('#studentTable tbody');
                tbody.innerHTML = data.map(s => {
                    const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name || 'SV')}&background=2563eb&color=fff`;
                    return `
                    <tr>
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="${escapeHtml(s.avatar || avatarFallback)}" class="avatar-circle me-3" alt="Avatar ${escapeHtml(s.name || 'sinh viên')}" onerror="this.src='${avatarFallback}'">
                                <div>
                                    <div class="student-name">${escapeHtml(s.name || 'Chưa có tên')}</div>
                                    <div class="student-id">Mã: ${escapeHtml(s.id)}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="contact-line"><i class="bi bi-envelope-at text-primary"></i>${escapeHtml(s.email || 'Chưa có email')}</div>
                            <div class="contact-line"><i class="bi bi-phone text-secondary"></i>${escapeHtml(s.phone || 'Chưa có số điện thoại')}</div>
                        </td>
                        <td class="text-end">
                            <button class="btn btn-outline-warning btn-icon me-1" title="Sửa sinh viên" onclick="editModeEncoded('${encodeArg(s.id)}', '${encodeArg(s.name)}', '${encodeArg(s.email)}', '${encodeArg(s.phone)}', '${encodeArg(s.avatar)}')"><i class="bi bi-pencil-square"></i></button>
                            <button class="btn btn-outline-danger btn-icon" title="Xóa sinh viên" onclick="deleteStudent('${encodeArg(s.id)}')"><i class="bi bi-trash-fill"></i></button>
                        </td>
                    </tr>
                    `;
                }).join('');

                dataTable = $('#studentTable').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/vi.json'
                    },
                    pageLength: 10,
                    order: [[0, 'asc']],
                    autoWidth: false,
                    columnDefs: [
                        { orderable: false, targets: 2 }
                    ]
                });

                document.getElementById('totalCount').innerHTML = `<i class="bi bi-people"></i> ${data.length} sinh viên`;
                document.getElementById('heroCount').innerText = data.length;
            } catch (e) {
                console.error("Lỗi API:", e);
                Swal.fire('Lỗi', 'Không thể kết nối đến dữ liệu!', 'error');
            }
        }

        async function handleSave() {
            const id = document.getElementById('studentId').value;
            const student = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                avatar: document.getElementById('avatar').value.trim()
            };

            if (!student.name || !student.email) {
                Swal.fire('Lưu ý', 'Vui lòng nhập ít nhất tên và email!', 'info');
                return;
            }

            Swal.showLoading();
            const method = id ? 'PUT' : 'POST';
            const url = id ? `${API_URL}/${id}` : API_URL;

            try {
                await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(student)
                });

                Swal.fire('Hoàn tất', id ? 'Đã cập nhật thông tin!' : 'Đã thêm thành công!', 'success');
                clearForm();
                loadData();
            } catch (error) {
                Swal.fire('Lỗi', 'Không thể lưu dữ liệu!', 'error');
            }
        }

        async function deleteStudent(id) {
            id = decodeArg(id);
            const result = await Swal.fire({
                title: 'Xác nhận xóa?',
                text: "Bạn không thể hoàn tác hành động này!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                confirmButtonText: 'Đúng, xóa ngay!',
                cancelButtonText: 'Hủy'
            });

            if (result.isConfirmed) {
                try {
                    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                    loadData();
                    Swal.fire('Đã xóa!', 'Dữ liệu sinh viên đã được loại bỏ.', 'success');
                } catch (error) {
                    Swal.fire('Lỗi', 'Không thể xóa dữ liệu!', 'error');
                }
            }
        }

        function editMode(id, name, email, phone, avatar) {
            document.getElementById('studentId').value = id;
            document.getElementById('name').value = name;
            document.getElementById('email').value = email;
            document.getElementById('phone').value = phone;
            document.getElementById('avatar').value = avatar;
            document.getElementById('formTitle').innerText = 'Cập nhật sinh viên';

            window.scrollTo({ top: 100, behavior: 'smooth' });
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'info',
                title: 'Đang sửa: ' + name,
                showConfirmButton: false,
                timer: 2000
            });
        }

        function editModeEncoded(id, name, email, phone, avatar) {
            editMode(decodeArg(id), decodeArg(name), decodeArg(email), decodeArg(phone), decodeArg(avatar));
        }

        function clearForm() {
            document.getElementById('studentForm').reset();
            document.getElementById('studentId').value = '';
            document.getElementById('formTitle').innerText = 'Thêm sinh viên';
        }

        $(document).ready(function () {
            loadData();
        });
