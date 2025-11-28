import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select } from "antd";
import { userService } from "../../service/userService";
import { useDispatch, useSelector } from "react-redux";
import { setInfoUser } from "../../stores/user";
import {
  keyLocalStorage,
  localStorageUtil,
} from "../../components/util/localStorage";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { setListMaNhom } from "../../stores/manhom";
import { khoahocService } from "../../service/khoahocService";

const { Option } = Select;
const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const listMaNhom = useSelector((state) => state.manhomSlice.listMaNhom);
  console.log("listMaNhom", listMaNhom);

  const fetchListMaNhom = async () => {
    try {
      const nhomList = await khoahocService.getListNhom();
      dispatch(setListMaNhom(nhomList));
    } catch (error) {
      console.log("errorListMaNhom", error);
    }
  };

  useEffect(() => {
    fetchListMaNhom();
  }, []);

  const onFinishLogin = async (values) => {
    try {
      const responseLogin = await userService.postLogin(values);
      console.log("responseLogin", responseLogin);

      const infoUser = responseLogin.data;
      //lưu info vào redux
      dispatch(setInfoUser(infoUser));
      //lưu info với localStorage
      localStorageUtil.set(keyLocalStorage.INFO_USER, infoUser);
      toast.success("Đăng nhập thành công ");
      navigate("/");
    } catch (error) {
      console.log("error", error);
      toast.error(
        error.response?.data?.content ||
          "Đăng nhập thất bại! Vui lòng kiểm tra lại."
      );
    }
  };

  const onFinishRegister = async (values) => {
    try {
      const responseRegister = await userService.postRegister(values);
      console.log("responseRegister", responseRegister);

      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      setIsLogin(true);
    } catch (error) {
      console.log("errorRegister", error);

      // kiểm tra thông báo từ backend
      if (error.response && error.response.data) {
        toast.error(error.response.data);
      } else {
        toast.error("Đăng ký thất bại! Vui lòng kiểm tra lại.");
      }
    }
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="relative w-full max-w-5xl min-h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Wrapper chứa 2 panel */}
        {/* Wrapper đăng nhập */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center p-8 transition-transform duration-700 ease-in-out
          ${
            isLogin
              ? "translate-x-0 opacity-100"
              : "-translate-x-1/2 opacity-100   "
          }`}
        >
          <h2 className="text-2xl font-bold mb-2">Đăng nhập</h2>
          <p className="text-gray-500 mb-6">
            Hoặc sử dụng tài khoản đã đăng ký
          </p>
          <Form layout="vertical" onFinish={onFinishLogin}>
            <Form.Item
              name="taiKhoan"
              rules={[{ required: true, message: "Vui lòng nhập tài khoản" }]}
            >
              <Input placeholder="Tài khoản" size="large" />
            </Form.Item>
            <Form.Item
              name="matKhau"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password placeholder="Mật khẩu" size="large" />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-40 mt-2 !bg-teal-600 !hover:bg-teal-700 !text-white !border-none !shadow-none"
              size="large"
            >
              Đăng nhập
            </Button>
          </Form>
        </div>

        {/* Wrapper đăng ký */}
        <div
          className={`absolute top-0 right-0 w-1/2 h-full flex flex-col justify-center p-8 transition-transform duration-700 ease-in-out
    ${isLogin ? "translate-x-1/4 opacity-100" : "translate-x-0 opacity-100"}`}
        >
          <h2 className="text-2xl font-bold mb-2">Đăng ký</h2>
          <p className="text-gray-500 mb-6">
            Vui lòng nhập thông tin để tạo tài khoản mới
          </p>
          <Form layout="vertical" onFinish={onFinishRegister}>
            <Form.Item
              name="hoTen"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input placeholder="Họ tên" size="large" />
            </Form.Item>
            <Form.Item
              name="taiKhoan"
              rules={[{ required: true, message: "Vui lòng nhập tài khoản" }]}
            >
              <Input placeholder="Tài khoản" size="large" />
            </Form.Item>
            <Form.Item
              name="matKhau"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password placeholder="Mật khẩu" size="large" />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Email không hợp lệ",
                },
              ]}
            >
              <Input placeholder="Email" size="large" />
            </Form.Item>
            <Form.Item
              name="soDT"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
              ]}
            >
              <Input placeholder="Số điện thoại" size="large" />
            </Form.Item>
            <Form.Item
              name="maNhom"
              rules={[{ required: true, message: "Vui lòng chọn mã nhóm" }]}
            >
              <Select
                placeholder="Chọn mã nhóm"
                size="large"
                className="w-full"
              >
                {listMaNhom.map((nhom) => (
                  <Option key={nhom} value={nhom}>
                    {nhom}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-40 mt-2 !bg-teal-600 !hover:bg-teal-700 !text-white !border-none !shadow-none"
              size="large"
            >
              Đăng ký
            </Button>
          </Form>
        </div>

        {/* Overlay panel */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full bg-gradient-to-r from-teal-400 to-yellow-400 flex items-center justify-center text-center text-white p-8 transition-transform duration-700 ease-in-out ${
            isLogin ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {isLogin ? "Xin chào!" : "Chào mừng bạn đã trở lại!"}
            </h2>
            <p className="mb-6">
              {isLogin
                ? "Vui lòng nhấn đăng ký để tạo tài khoản mới."
                : "Vui lòng đăng nhập để kết nối tài khoản của bạn."}
            </p>
            <Button
              ghost
              size="large"
              className="border-white text-white"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Đăng ký" : "Đăng nhập"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
