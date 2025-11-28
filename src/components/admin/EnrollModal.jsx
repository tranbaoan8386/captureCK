import { useEffect, useMemo, useState } from "react";
import { Modal, Select, Button, Table, Divider, Space } from "antd";
import { alert } from "../util/alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../service/userService";
import { khoahocService } from "../../service/khoahocService";
import { useClientFilterPaginate } from "../util/table";
export default function EnrollModal({ open, onClose, user }) {
  const qc = useQueryClient();
  const taiKhoan = user?.taiKhoan;

  // state chọn khóa học để ghi danh
  const [searchCourse, setSearchCourse] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);

  const pageSize = 10;
  const REFRESH = () => {
    qc.invalidateQueries({ queryKey: ["courses-not-enrolled"] });
    qc.invalidateQueries({ queryKey: ["userCourses-wait-all"] });
    qc.invalidateQueries({ queryKey: ["userCourses-enrolled-all"] });
  };
  // 1) Danh sách khóa học cho Select
  const { data: notEnrolledAll = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["courses-not-enrolled", {taiKhoan }],
    queryFn: async () => {
      const res = await userService.layDanhSachKhoaHocChuaGhiDanh({
        taiKhoan
      });
      // Chuẩn hóa về mảng
      return Array.isArray(res.data?.content)
        ? res.data.content
        : res.data || [];
    },
    enabled: open && !!taiKhoan, // chỉ fetch khi modal mở
  });
  const listAllCourses = useMemo(() => {
    const q = (searchCourse || "").trim().toLowerCase();
    if (!q) return notEnrolledAll;
    return notEnrolledAll.filter((c) =>
      String(
        c.tenKhoaHoc ||
        c.tenKhoaHocAlias ||
        c.tenKhoaHocVN ||
        c.tenKhoaHocEN ||
        ""
      ).toLowerCase().includes(q)
    );
  }, [notEnrolledAll, searchCourse]);
  const selectOptions = useMemo(
    () =>
      (listAllCourses || []).map((c) => ({
        label:
          c.tenKhoaHoc ||
          c.tenKhoaHocAlias ||
          c.tenKhoaHocVN ||
          c.tenKhoaHocEN ||
          c.tenKhoaHoc,
        value: c.maKhoaHoc,
      })),
    [listAllCourses]
  );

  // 2) Khóa học chờ xác thực
  const { data: waitAll = [], isLoading: loadingWait } = useQuery({
    queryKey: ["userCourses-wait-all", { taiKhoan }],
    queryFn: async () => {
      const res = await userService.layDanhSachKhoaHocChoXetDuyet({ taiKhoan });
      const arr = Array.isArray(res.data?.content)
        ? res.data.content
        : res.data || [];
      return arr;
    },
    enabled: open && !!taiKhoan,
  });
  const {
    page: pWait, setPage: setPWait, pageItems: waitItems, total: waitTotal
  } = useClientFilterPaginate(waitAll, (c) => c.tenKhoaHoc ?? "", pageSize);

  // 3) Khóa học đã ghi danh
  const { data: enrolledAll = [], isLoading: loadingEnrolled } = useQuery({
    queryKey: ["userCourses-enrolled-all", { taiKhoan }],
    queryFn: async () => {
      const res = await userService.layDanhSachKhoaHocDaXetDuyet({ taiKhoan });
      const arr = Array.isArray(res.data?.content)
        ? res.data.content
        : res.data || [];
      return arr;
    },
    enabled: open && !!taiKhoan,
  });
  const {
    page: pEnrolled, setPage: setPEnrolled, pageItems: enrolledItems, total: enrolledTotal
  } = useClientFilterPaginate(enrolledAll, (c) => c.tenKhoaHoc ?? "", pageSize);

  // 4) Mutations
  const muEnroll = useMutation({
    mutationFn: (payload) => userService.ghiDanhKhoaHoc(payload),
    onSuccess: () => {
      alert.success("Đã gửi yêu cầu ghi danh");
      setSelectedCourse(null);
      REFRESH();
    },
    onError: (e) => alert.error(e?.response?.data || "Ghi danh thất bại"),
  });

  const muApprove = useMutation({
    mutationFn: (payload) => userService.ghiDanhKhoaHoc(payload),
    onSuccess: () => {
      alert.success("Đã xác thực");
      setPWait(1);
      setPEnrolled(1);
      REFRESH();
    },
    onError: (e) => alert.error(e?.response?.data || "Xác thực thất bại"),
  });

  const muCancel = useMutation({
    mutationFn: (payload) => userService.huyGhiDanh(payload),
    onSuccess: () => {
      alert.success("Đã xóa ghi danh");
      setPWait(1);
      setPEnrolled(1);
      REFRESH();
    },
    onError: (e) => alert.error(e?.response?.data || "Xóa ghi danh thất bại"),
  });

  // 5) Columns 2 bảng
  const columns = (isWaitTable) => [
    {
      title: "STT",
      width: 70,
      render: (_, __, i) =>
        (isWaitTable ? (pWait - 1) * pageSize : (pEnrolled - 1) * pageSize) + i + 1,
    },
    { title: "Tên khóa học", dataIndex: "tenKhoaHoc" },
    {
      title: "Chờ xác nhận",
      width: 220,
      align: "right",
      render: (_, record) => (
        <Space>
          {isWaitTable ? (
            <>
              <Button
                type="primary"
                loading={muApprove.isLoading}
                onClick={() =>
                  muApprove.mutate({ maKhoaHoc: record.maKhoaHoc, taiKhoan })
                }
              >
                Xác thực
              </Button>
              <Button
                danger
                loading={muCancel.isLoading}
                onClick={() =>
                  muCancel.mutate({ maKhoaHoc: record.maKhoaHoc, taiKhoan })
                }
              >
                Xóa
              </Button>
            </>
          ) : (
            <Button
              danger
              loading={muCancel.isLoading}
              onClick={() =>
                muCancel.mutate({ maKhoaHoc: record.maKhoaHoc, taiKhoan })
              }
            >
              Xóa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 6) Submit ghi danh
  const handleEnroll = () => {
    if (!selectedCourse) return alert.warning("Hãy chọn khóa học");
    muEnroll.mutate({ maKhoaHoc: selectedCourse, taiKhoan });
  };

  // reset state khi mở/đóng
  useEffect(() => {
    if (!open) {
      setSelectedCourse(null);
      setSearchCourse("");
      setPWait(1);
      setPEnrolled(1);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Chọn khóa học"
      width={800}
      destroyOnClose
    >
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Select
          showSearch
          allowClear
          placeholder="Chọn khóa học"
          value={selectedCourse}
          onChange={setSelectedCourse}
          onSearch={setSearchCourse}
          filterOption={false}
          loading={loadingCourses}
          options={selectOptions}
          style={{ flex: 1 }}
          size="large"
        />
        <Button
          type="primary"
          size="large"
          onClick={handleEnroll}
          loading={muEnroll.isLoading}
        >
          Ghi danh
        </Button>
      </div>

      <Divider />

      <h4 style={{ marginBottom: 8 }}>Khóa học chờ xác thực</h4>
      <Table
        rowKey="maKhoaHoc"
        columns={columns(true)}
        dataSource={waitItems}
        loading={loadingWait}
        pagination={{
          current: pWait,
          pageSize,
          total: waitTotal,
          onChange: (pg) => setPWait(pg.current),
          showSizeChanger: false,
        }}
        locale={{ emptyText: "Không có khóa học chờ xác thực" }}
      />

      <Divider />

      <h4 style={{ marginBottom: 8 }}>Khóa học đã ghi danh</h4>
      <Table
        rowKey="maKhoaHoc"
        columns={columns(false)}
        dataSource={enrolledItems}
        loading={loadingEnrolled}
        pagination={{
          current: pEnrolled,
          pageSize,
          total: enrolledTotal,
          onChange: (pg) => setPEnrolled(pg.current),
          showSizeChanger: false,
        }}
        locale={{ emptyText: "Chưa có khóa học đã ghi danh" }}
      />
    </Modal>
  );
}
