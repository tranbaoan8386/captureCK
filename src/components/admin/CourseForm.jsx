import {
  Modal,
  Form as AntForm,
  Button,
  Input,
  Row,
  Col,
  Divider,
  Select,
  DatePicker,
  InputNumber,
  Upload,
} from "antd";
import { alert } from "../util/alert";
import { useEffect, useState, useMemo } from "react";
import { khoahocService } from "../../service/khoahocService";
import { userService } from "../../service/userService";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function CourseForm({
  open,
  onClose,
  onSubmit,
  initialValues,
  isEdit,
  defaultMaNhom = "GP01",
}) {
  const [form] = AntForm.useForm();
  const [danhMucOptions, setDanhMucOptions] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const revokePreview = (url) => {
    try {
      url && URL.revokeObjectURL(url);
    } catch {}
  };
  const clearImage = () => {
    setFile(null);
    revokePreview(previewUrl);
    setPreviewUrl(null);
    // clear cả Form fields
    form.setFieldsValue({ upload: [], hinhAnh: "" });
  };
  // Lấy danh mục
  useEffect(() => {
    khoahocService
      .layDanhMucKhoaHoc()
      .then((res) => {
        const arr = Array.isArray(res.data)
          ? res.data
          : res.data?.content || [];
        setDanhMucOptions(
          arr.map((d) => ({
            value: d.maDanhMuc || d.maDanhMucKhoaHoc,
            label: d.tenDanhMuc || d.tenDanhMucKhoaHoc,
          }))
        );
      })
      .catch(() => setDanhMucOptions([]));
  }, []);

  // Lấy info tài khoản để fill người tạo
  useEffect(() => {
    if (!open) return;
    setLoadingInfo(true);
    userService
      .thongTinTaiKhoan()
      .then((res) => {
        const info = res?.data?.content || res?.data || {};
        if (info?.maLoaiNguoiDung !== "GV") {
          alert.error(
            "Tài khoản hiện tại không phải giảng viên. Không thể thêm/sửa khóa học."
          );
          onClose?.();
          return;
        }
        form.setFieldsValue({ taiKhoanNguoiTao: info?.taiKhoan || "" });
      })
      .catch(() => {
        alert.error("Không lấy được thông tin tài khoản.");
        onClose?.();
      })
      .finally(() => setLoadingInfo(false));
  }, [open]);

  // Set default/initial form & reset preview/file
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        maKhoaHoc: initialValues.maKhoaHoc,
        tenKhoaHoc: initialValues.tenKhoaHoc,
        moTa: initialValues.moTa,
        maNhom: initialValues.maNhom || defaultMaNhom,
        maDanhMucKhoaHoc: initialValues.danhMucKhoaHoc?.maDanhMucKhoaHoc,
        hinhAnh: initialValues.hinhAnh || "",
        danhGia: initialValues.danhGia ?? 0,
        luotXem: initialValues.luotXem ?? 0,
        ngayTao: initialValues.ngayTao
          ? dayjs(initialValues.ngayTao, [
              "DD/MM/YYYY",
              "YYYY-MM-DD",
              dayjs.ISO_8601,
            ])
          : null,
        upload: [],
      });
      setFile(null);
      revokePreview(previewUrl);
      setPreviewUrl(null); // sẽ fallback hiển thị từ initial nếu là URL
    } else {
      form.setFieldsValue({
        maKhoaHoc: "",
        tenKhoaHoc: "",
        moTa: "",
        maNhom: defaultMaNhom,
        maDanhMucKhoaHoc: undefined,
        taiKhoanNguoiTao: "",
        danhGia: 0,
        luotXem: 0,
        ngayTao: null,
        hinhAnh: "",
        upload: [],
      });
      setFile(null);
      revokePreview(previewUrl);
      setPreviewUrl(null);
    }
  }, [initialValues, form, defaultMaNhom, open]);

  // Tạo trước URL preview từ initial (khi không chọn file mới)
  const initialPreview = useMemo(() => {
    const h = initialValues?.hinhAnh;
    if (!h) return null;
    try {
      // Nếu là URL tuyệt đối hoặc bắt đầu bằng http(s)
      const looksLikeUrl = /^https?:\/\//i.test(h) || h.startsWith("blob:");
      return looksLikeUrl ? h : null;
    } catch {
      return null;
    }
  }, [initialValues]);

  const normUpload = (e) => {
    let list = e?.fileList ?? [];
    const last = list[list.length - 1];
    const f = last?.originFileObj ?? null;
    setFile(f);
    if (f) {
      // thu dọn URL cũ nếu có
      revokePreview(previewUrl);
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
      //  fill tên file + đuôi vào trường hinhAnh
      form.setFieldsValue({ hinhAnh: f.name });
    } else {
      revokePreview(previewUrl);
      setPreviewUrl(null);
      form.setFieldsValue({ hinhAnh: "" });
    }
    return f ? [last] : [];
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={isEdit ? "Sửa khóa học" : "Thêm khóa học"}
      width={860}
      destroyOnClose
      confirmLoading={loadingInfo}
    >
      <AntForm
        layout="vertical"
        form={form}
        onFinish={(values) => onSubmit(values)}
      >
        <Row gutter={[16, 8]}>
          <Col xs={24} md={12}>
            <AntForm.Item
              label="Mã khóa học"
              name="maKhoaHoc"
              rules={[{ required: true, message: "Bắt buộc" }]}
            >
              <Input size="large" placeholder="VD: BC001" disabled={isEdit} />
            </AntForm.Item>
          </Col>
          <Col xs={24} md={12}>
            <AntForm.Item
              label="Tên khóa học"
              name="tenKhoaHoc"
              rules={[{ required: true, message: "Bắt buộc" }]}
            >
              <Input size="large" placeholder="VD: ReactJS Pro" />
            </AntForm.Item>
          </Col>

          <Col xs={24} md={12}>
            <AntForm.Item
              label="Danh mục khóa học"
              name="maDanhMucKhoaHoc"
              rules={[{ required: true, message: "Bắt buộc" }]}
            >
              <Select
                size="large"
                placeholder="Chọn danh mục"
                options={danhMucOptions}
              />
            </AntForm.Item>
          </Col>
          <Col xs={24} md={12}>
            <AntForm.Item label="Ngày tạo" name="ngayTao">
              <DatePicker
                size="large"
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
              />
            </AntForm.Item>
          </Col>

          <Col xs={24} md={12}>
            <AntForm.Item label="Đánh giá" name="danhGia">
              <InputNumber
                min={0}
                max={10}
                precision={1}
                size="large"
                style={{ width: "100%" }}
                placeholder="0-10"
              />
            </AntForm.Item>
          </Col>
          <Col xs={24} md={12}>
            <AntForm.Item label="Lượt xem" name="luotXem">
              <InputNumber min={0} size="large" style={{ width: "100%" }} />
            </AntForm.Item>
          </Col>

          <Col xs={24} md={12}>
            <AntForm.Item
              label="Người tạo"
              name="taiKhoanNguoiTao"
              rules={[{ required: true, message: "Bắt buộc" }]}
            >
              <Input size="large" disabled />
            </AntForm.Item>
          </Col>
          <Col xs={24} md={12}>
            <AntForm.Item
              label="Mã nhóm"
              name="maNhom"
              rules={[{ required: true, message: "Bắt buộc" }]}
            >
              <Input size="large" placeholder="VD: GP01" />
            </AntForm.Item>
          </Col>

          {/* Trường text sẽ được auto fill bằng file.name */}
          <Col xs={24}>
            <AntForm.Item label="Hình ảnh (tên file)" name="hinhAnh">
              <Input size="large" placeholder="Ví dụ: react-pro.png" />
            </AntForm.Item>
          </Col>

          <Col xs={24}>
            <AntForm.Item
              name="upload"
              label="Chọn ảnh để preview + fill tên file"
              valuePropName="fileList"
              getValueFromEvent={normUpload}
            >
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                multiple={false}
                accept="image/*"
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Chọn tệp</Button>
              </Upload>
              {(previewUrl || initialPreview) && (
                <Button
                  danger
                  size="small"
                  onClick={clearImage}
                  style={{ marginLeft: 8 }}
                >
                  Xóa ảnh
                </Button>
              )}
              {/* Preview ảnh */}
              {(previewUrl || initialPreview) && (
                <div
                  style={{
                    marginTop: 12,
                    border: "1px solid #eee",
                    borderRadius: 8,
                    padding: 8,
                    display: "inline-block",
                  }}
                >
                  <img
                    src={previewUrl || initialPreview}
                    alt="preview"
                    style={{ maxWidth: 320, maxHeight: 200, display: "block" }}
                  />
                </div>
              )}
            </AntForm.Item>
          </Col>

          <Col xs={24}>
            <AntForm.Item label="Mô tả" name="moTa">
              <Input.TextArea rows={5} placeholder="Nhập mô tả" />
            </AntForm.Item>
          </Col>
        </Row>

        <Divider style={{ margin: "8px 0 16px" }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            {isEdit ? "Cập nhật" : "Thêm"}
          </Button>
        </div>
      </AntForm>
    </Modal>
  );
}
