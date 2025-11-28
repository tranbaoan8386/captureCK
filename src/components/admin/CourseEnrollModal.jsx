import { useEffect, useMemo, useState } from "react";
import { Modal, Select, Button, Table, Space, Divider } from "antd";
import { alert } from "../util/alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../service/userService";
import SearchInput from "./parts/SearchInput";
import { useClientFilterPaginate } from "../util/table";
export default function CourseEnrollModal({ open, onClose, course, currentAdminTaiKhoan }) {
  const qc = useQueryClient();
  const maKhoaHoc = course?.maKhoaHoc;

  // tìm kiếm dropdown (người dùng chưa ghi danh)
  const [searchUser, setSearchUser] = useState("");
  const [chosenUser, setChosenUser] = useState(null);

  const pageSize = 10;

  const REFRESH = () => {
    qc.invalidateQueries({ queryKey: ["course-not-enrolled", maKhoaHoc] });
    qc.invalidateQueries({ queryKey: ["course-wait", maKhoaHoc] });
    qc.invalidateQueries({ queryKey: ["course-joined", maKhoaHoc] });
  };

  /* ========== QUERIES ========== */

  // Người dùng CHƯA ghi danh
  const { data: notEnrolledFull = [], isLoading: loadingNE } = useQuery({
    queryKey: ["course-not-enrolled", maKhoaHoc],
    queryFn: async () => {
      const res = await userService.layDanhSachNguoiDungChuaGhiDanh({ maKhoaHoc });
      return Array.isArray(res.data?.content) ? res.data.content : (res.data || []);
    },
    enabled: open && !!maKhoaHoc,
  });

  const notEnrolledFiltered = useMemo(() => {
    const q = searchUser.trim().toLowerCase();
    if (!q) return notEnrolledFull;
    return notEnrolledFull.filter((u) => {
      const s =
        `${u.taiKhoan || ""} ${u.hoTen || ""} ${u.soDT || ""}`.toLowerCase();
      return s.includes(q);
    });
  }, [notEnrolledFull, searchUser]);

  const userOptions = useMemo(
    () =>
      notEnrolledFiltered.map((u) => ({
        value: u.taiKhoan,
        label: `${u.hoTen ?? u.taiKhoan} (${u.taiKhoan})`,
      })),
    [notEnrolledFiltered]
  );

  // Học viên CHỜ XÁC THỰC
  const { data: waitFull = [], isLoading: loadingWait } = useQuery({
    queryKey: ["course-wait", maKhoaHoc],
    queryFn: async () => {
      const res = await userService.layDanhSachHocVienChoXetDuyet({ maKhoaHoc });
      return Array.isArray(res.data?.content) ? res.data.content : (res.data || []);
    },
    enabled: open && !!maKhoaHoc,
  });

  const {
    q: qWait, setQ: setQWait, page: pWait, setPage: setPWait,
    pageItems: waitPage, total: waitTotal,
  } = useClientFilterPaginate(waitFull, (u) => `${u.taiKhoan||""} ${u.hoTen||""} ${u.soDT||""}`, pageSize);

  // Học viên ĐÃ THAM GIA
  const { data: joinedFull = [], isLoading: loadingJoined } = useQuery({
    queryKey: ["course-joined", maKhoaHoc],
    queryFn: async () => {
      const res = await userService.layDanhSachHocVienKhoaHoc({ maKhoaHoc });
      return Array.isArray(res.data?.content) ? res.data.content : (res.data || []);
    },
    enabled: open && !!maKhoaHoc,
  });

  const {
    q: qJoined, setQ: setQJoined, page: pJoined, setPage: setPJoined,
    pageItems: joinedPage, total: joinedTotal,
  } = useClientFilterPaginate(joinedFull, (u) => `${u.taiKhoan||""} ${u.hoTen||""} ${u.soDT||""}`, pageSize);

  /* ========== MUTATIONS ========== */

  // Ghi danh (chọn người dùng ở trên)
  const muEnroll = useMutation({
    mutationFn: ({ taiKhoan }) => userService.ghiDanhKhoaHoc({ maKhoaHoc, taiKhoan }),
    onSuccess: () => {
      alert.success("Đã gửi ghi danh");
      setChosenUser(null);
      REFRESH();
    },
    onError: (e) => alert.error(e?.response?.data || "Ghi danh thất bại"),
  });

  const muApprove = useMutation({
    mutationFn: ({ taiKhoan }) => userService.ghiDanhKhoaHoc({ maKhoaHoc, taiKhoan }),
    onSuccess: () => {
      alert.success("Đã xác thực");
      setPWait(1);
      REFRESH();
    },
    onError: (e) => alert.error(e?.response?.data || "Xác thực thất bại"),
  });

  // Hủy ghi danh (xóa) từ cả 2 bảng
  const muRemove = useMutation({
    mutationFn: ({ taiKhoan }) => userService.huyGhiDanh({ maKhoaHoc, taiKhoan }),
    onSuccess: () => {
      alert.success("Đã xóa ghi danh");
      setPWait(1); setPJoined(1);
      REFRESH();
    },
    onError: (e) => alert.error(e?.response?.data || "Xóa ghi danh thất bại"),
  });

  /* ========== TABLE COLUMNS ========== */

  const columns = (type) => [
    {
      title: "STT",
      width: 70,
      render: (_, __, i) => (type === "wait" ? (pWait - 1) * pageSize : (pJoined - 1) * pageSize) + i + 1,
    },
    { title: "Tài khoản", dataIndex: "taiKhoan" },
    { title: "Học viên", dataIndex: "hoTen" },
    {
      title: "Chờ xác nhận",
      align: "right",
      width: 200,
      render: (_, r) => (
        <Space>
          {type === "wait" ? (
            <>
              <Button type="primary" loading={muApprove.isLoading}
                      onClick={() => muApprove.mutate({ taiKhoan: r.taiKhoan })}>
                Xác thực
              </Button>
              <Button danger loading={muRemove.isLoading}
                      onClick={() => muRemove.mutate({ taiKhoan: r.taiKhoan })}>
                Xóa
              </Button>
            </>
          ) : (
            <Button danger loading={muRemove.isLoading}
                    onClick={() => muRemove.mutate({ taiKhoan: r.taiKhoan })}>
              Xóa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  /* ========== RENDER ========== */

  useEffect(() => {
    if (!open) {
      setSearchUser(""); setChosenUser(null);
      setQWait(""); setQJoined("");
      setPWait(1); setPJoined(1);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      title="Chọn người dùng"
      destroyOnClose
    >
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Select
          showSearch
          allowClear
          placeholder="Tên người dùng"
          value={chosenUser}
          options={userOptions}
          onSearch={setSearchUser}
          onChange={setChosenUser}
          filterOption={false}
          loading={loadingNE}
          style={{ flex: 1 }}
          size="large"
        />
        <Button
          type="primary"
          size="large"
          loading={muEnroll.isLoading}
          onClick={() => {
            if (!chosenUser) return alert.warning("Chọn người dùng trước đã");
            muEnroll.mutate({ taiKhoan: chosenUser });
          }}
        >
          Ghi danh
        </Button>
      </div>

      <h3>Học viên chờ xác thực</h3>
      <SearchInput
        placeholder="Nhập tên học viên hoặc số điện thoại"
        value={qWait}
        onChange={(v) => { setQWait(v); setPWait(1); }}
        style={{ marginBottom: 8 }}
      />
      <Table
        rowKey="taiKhoan"
        columns={columns("wait")}
        dataSource={waitPage}
        loading={loadingWait}
        pagination={{
          current: pWait,
          pageSize,
          total: waitTotal,
          onChange: setPWait,
          showSizeChanger: false,
        }}
        locale={{ emptyText: "Không có học viên chờ xác thực" }}
      />

      <Divider />

      <h3>Học viên đã tham gia khóa học</h3>
      <SearchInput
        placeholder="Nhập tên học viên hoặc số điện thoại"
        value={qJoined}
        onChange={(v) => { setQJoined(v); setPJoined(1); }}
        style={{ marginBottom: 8 }}
      />
      <Table
        rowKey="taiKhoan"
        columns={columns("joined")}
        dataSource={joinedPage}
        loading={loadingJoined}
        pagination={{
          current: pJoined,
          pageSize,
          total: joinedTotal,
          onChange: setPJoined,
          showSizeChanger: false,
        }}
        locale={{ emptyText: "Chưa có học viên đã tham gia" }}
      />
    </Modal>
  );
}
