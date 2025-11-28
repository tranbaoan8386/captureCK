import { useMemo, useState } from "react";
import { Card, Button, message } from "antd";
import { alert } from "../../components/util/alert";
import { khoahocService } from "../../service/khoahocService";
import CourseTable from "../../components/admin/CourseTable";
import CourseForm from "../../components/admin/CourseForm";
import CourseEnrollModal from "../../components/admin/CourseEnrollModal";
import CourseFilters from "../../components/admin/CourseFilters";
import { useCourses } from "../../queries/useCourses";
import { toSlug } from "../../components/util/course";

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [maNhom, setMaNhom] = useState("GP01");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [enrollCourse, setEnrollCourse] = useState(null);

  const infoUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("INFO_USER") || "null"); }
    catch { return null; }
  }, []);

  const { data, isLoading, refetch } = useCourses({ search, page, pageSize, maNhom });
  const items = data?.items || [];
  const total = data?.totalCount || 0;

  const handleOpenAdd = () => { setEditing(null); setModalOpen(true); };
  const handleEdit = (record) => { setEditing(record); setModalOpen(true); };

  const handleDelete = async (record) => {
    try {
      await khoahocService.xoaKhoaHoc(record.maKhoaHoc);
      alert.success("Đã xóa khóa học");
      refetch();
    } catch (e) {
      alert.error(e?.response?.data || "Xóa thất bại");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        maKhoaHoc: formData.maKhoaHoc?.trim(),
        biDanh: (formData.biDanh || toSlug(formData.tenKhoaHoc || "")).trim(),
        tenKhoaHoc: formData.tenKhoaHoc?.trim(),
        moTa: formData.moTa || "",
        luotXem: Number(formData.luotXem ?? 0),
        danhGia: Number(formData.danhGia ?? 0),
        hinhAnh: (formData.hinhAnh || "").trim(),
        maNhom: (formData.maNhom || "GP01").trim(),
        ngayTao: formData.ngayTao ? formData.ngayTao.format("DD/MM/YYYY") : undefined,
        maDanhMucKhoaHoc: formData.maDanhMucKhoaHoc,
        taiKhoanNguoiTao: formData.taiKhoanNguoiTao,
      };

      if (editing) {
        await khoahocService.capNhatKhoaHoc(payload);
        alert.success("Đã cập nhật khóa học");
      } else {
        await khoahocService.themKhoaHoc(payload);
        alert.success("Đã thêm khóa học");
      }

      setModalOpen(false);
      await refetch();
    } catch (e) {
      alert.error(e?.response?.data || (editing ? "Cập nhật thất bại" : "Thêm thất bại"));
    }
  };

  return (
    <Card
      title="Quản lý khóa học"
      extra={<Button type="primary" onClick={handleOpenAdd}>Thêm khóa học</Button>}
    >
      <CourseFilters
        maNhom={maNhom}
        onChangeGroup={(v) => { setMaNhom(v); setPage(1); }}
        onSearch={(val) => { setSearch(val); setPage(1); }}
      />

      <CourseTable
        dataSource={items}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        total={total}
        onChangePage={(p, ps) => { setPage(p); setPageSize(ps); }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onEnroll={(record) => setEnrollCourse(record)}
      />

      <CourseForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editing}
        isEdit={!!editing}
        defaultMaNhom={maNhom}
      />

      <CourseEnrollModal
        open={!!enrollCourse}
        onClose={() => setEnrollCourse(null)}
        course={enrollCourse}
        currentAdminTaiKhoan={infoUser?.taiKhoan}
      />
    </Card>
  );
}
