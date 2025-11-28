import { useMemo, useState } from "react";
import { Card, Button, message } from "antd";
import { alert } from "../../components/util/alert";
import UserTable from "../../components/admin/UserTable";
import UserForm from "../../components/admin/UserForm";
import EnrollModal from "../../components/admin/EnrollModal";
import { useUsersPage, useUserMutations } from "../../queries/useUsers";
import { useUserTypes } from "../../queries/useUserTypes";
import UserFilters from "../../components/admin/UserFilters";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollUser, setEnrollUser] = useState(null);

  // 1) Loại người dùng (tách ra hook)
  const { data: loaiNguoiDungOptions = [] } = useUserTypes();

  // 2) Danh sách người dùng (tách ra hook)
  const { data, isLoading } = useUsersPage({ search, page, pageSize });
  const items = useMemo(() => (Array.isArray(data?.items) ? data.items : []), [data]);
  const total = data?.totalCount ?? 0;

  // 3) CRUD mutations
  const { addUser, updateUser, deleteUser } = useUserMutations();

  // Handlers
  const handleOpenAdd = () => {
    setEditUser(null);
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditUser(record);
    setModalOpen(true);
  };

  const handleDelete = async (record) => {
    try {
      await deleteUser.mutateAsync(record.taiKhoan);
      alert.success("Đã xóa người dùng");
    } catch (e) {
      alert.error(e?.response?.data || "Xóa thất bại");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editUser) {
        await updateUser.mutateAsync({ ...editUser, ...formData, taiKhoan: editUser.taiKhoan });
        alert.success("Đã cập nhật người dùng");
      } else {
        await addUser.mutateAsync(formData);
        alert.success("Đã thêm người dùng");
      }
      setModalOpen(false);
    } catch (e) {
      alert.error(e?.response?.data || "Có lỗi xảy ra");
    }
  };

  return (
    <Card
      title="Quản lý người dùng"
      extra={<Button type="primary" onClick={handleOpenAdd}>Thêm người dùng</Button>}
    >
      <UserFilters
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
      />

      <UserTable
        dataSource={items}
        total={total}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        onChangePage={(p, ps) => {
          setPage(p);
          setPageSize(ps);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onEnroll={(record) => {
          setEnrollUser(record);
          setEnrollOpen(true);
        }}
      />

      {enrollOpen && (
        <EnrollModal
          open={enrollOpen}
          onClose={() => setEnrollOpen(false)}
          user={enrollUser}
        />
      )}

      <UserForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editUser}
        isEdit={!!editUser}
        loaiNguoiDungOptions={loaiNguoiDungOptions}
      />
    </Card>
  );
}
