import React, { useState, useEffect } from "react";
import {
  SearchOutlined,
  MenuOutlined,
  CloseOutlined,
  DownOutlined,
  UpOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { khoahocService } from "../../service/khoahocService";
import { setListDanhMuc } from "../../stores/danhmuc";
import { setInfoUser } from "../../stores/user";
import { keyLocalStorage, localStorageUtil } from "../util/localStorage";
import { setLogout } from "../../stores/user";

const handleLogout = () => {
  dispatch(setLogout());
  navigate("/");
};

const HeaderPage = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { infoUser } = useSelector((state) => state.userSlice);

  const listDanhMuc = useSelector((state) => state.danhmucSlice.listDanhMuc);
  console.log("listDanhMuc", listDanhMuc);
  const fetchListDanhMuc = async () => {
    try {
      const res = await khoahocService.getDanhMucKhoaHoc();
      dispatch(setListDanhMuc(res.data));
    } catch (err) {
      console.log("error", err);
    }
  };

  useEffect(() => {
    fetchListDanhMuc();
  }, []);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };
  const handleLogout = () => {
    dispatch(setLogout());
    navigate("/");
  };
  const handleRedirectDanhMucPage = (danhmucId) => {
    console.log("danhmucTen", danhmucId);
    //di chuyen qua trang danh muc
    navigate(`/danhmuckhoahoc/${danhmucId}`);
  };
  const handleRedirectKhoaHocPhanTrang = () => {
    navigate("/khoahoc");
  };
  const handleRedirectInfoUser = () => {
    navigate("/infoUser");
  };
  const handleRedirectBlog = () => {
    navigate("/blog");
  };
  const handleRedirectEven = () => {
    navigate("/event");
  };
  const handleRedirectInfoVlearningPage = () => {
    navigate("/thongtin");
  };
  return (
    <header className="w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-1 py-7">
        {/* Logo */}
        <div className="flex items-center mb-4">
          <h2
            className="text-2xl font-bold  flex items-center transform hover:scale-105 duration-800"
            style={{ textShadow: "5px -2px 3px #54d2c0" }}
          >
            <span className="mr-1 text-teal-600 text-5xl ">V</span>learning
          </h2>
        </div>

        {/* Search */}
        <div className="flex items-center rounded-md px-3 py-3 bg-gray-100 mx-4 mr-auto">
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="bg-transparent outline-none text-sm w-32 sm:w-48"
          />
          <SearchOutlined className="text-gray-500" />
        </div>

        {/* Menu desktop */}
        <nav className="hidden md:flex gap-6 font-medium text-gray-700 mr-auto relative">
          {/* DANH MỤC */}
          <div className="relative group">
            <a
              href="#"
              className="hover:text-yellow-600 flex items-center gap-1"
            >
              <MenuOutlined /> DANH MỤC
            </a>

            {/* Menu con render từ API */}
            <div
              className="absolute left-0 mt-2 w-56 bg-teal-400 text-white shadow-lg rounded 
                 origin-top transform scale-y-0 opacity-0 
                 group-hover:scale-y-100 group-hover:opacity-100 
                 transition-all duration-300 ease-in-out z-50"
            >
              {listDanhMuc?.map((dm) => (
                <a
                  key={dm.maDanhMuc}
                  onClick={() => handleRedirectDanhMucPage(dm.maDanhMuc)}
                  className="block px-4 py-2 hover:bg-teal-500 transition"
                >
                  {dm.tenDanhMuc}
                </a>
              ))}
            </div>
          </div>

          {/* Các menu khác */}
          <a
            onClick={handleRedirectKhoaHocPhanTrang}
            className="hover:text-yellow-600"
          >
            KHÓA HỌC
          </a>
          <a onClick={handleRedirectBlog} className="hover:text-yellow-600">
            BLOG
          </a>
          <a onClick={handleRedirectEven} className="hover:text-yellow-600">
            SỰ KIỆN
          </a>
          <a
            onClick={handleRedirectInfoVlearningPage}
            className="hover:text-yellow-600"
          >
            THÔNG TIN
          </a>
          {infoUser?.maLoaiNguoiDung === "GV" && (
            <button
              onClick={() => navigate("/admin/quanlynguoidung")}
              className="flex items-center gap-1 text-white bg-teal-600 hover:bg-teal-700 px-3 py-2 rounded"
            >
              <SettingOutlined />
            </button>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {infoUser ? (
            <>
              <span
                onClick={handleRedirectInfoUser}
                className="flex items-center gap-2 text-gray-700 "
              >
                <UserOutlined /> {infoUser.hoTen || "Người dùng"}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
              >
                <LogoutOutlined /> Đăng xuất
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded"
            >
              ĐĂNG NHẬP
            </button>
          )}
        </div>

        {/* Nút menu mobile */}
        <button
          className="md:hidden p-2"
          onClick={() => setOpenMenu(!openMenu)}
        >
          {openMenu ? (
            <CloseOutlined className="text-xl" />
          ) : (
            <MenuOutlined className="text-xl" />
          )}
        </button>
      </div>

      {/* Menu mobile */}
      {openMenu && (
        <div className="md:hidden border-t bg-white px-6 py-3 space-y-3">
          {/* DANH MỤC */}
          <div>
            <button
              onClick={() => toggleDropdown("danhmuc")}
              className="w-full flex justify-between items-center hover:text-yellow-600"
            >
              DANH MỤC
              {openDropdown === "danhmuc" ? <UpOutlined /> : <DownOutlined />}
            </button>
            {openDropdown === "danhmuc" && (
              <div className="pl-4 mt-2 space-y-2 text-gray-700">
                {listDanhMuc?.map((dm) => (
                  <a
                    key={dm.maDanhMuc}
                    onClick={() => {
                      handleRedirectDanhMucPage(dm.maDanhMuc);
                      setOpenMenu(false);
                    }}
                    className="block hover:text-yellow-600"
                  >
                    {dm.tenDanhMuc}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* KHÓA HỌC */}
          <a
            onClick={() => {
              handleRedirectKhoaHocPhanTrang();
              setOpenMenu(false);
            }}
            className="block hover:text-yellow-600"
          >
            KHÓA HỌC
          </a>
          <a
            onClick={() => {
              handleRedirectBlog();
              setOpenMenu(false);
            }}
            className="block hover:text-yellow-600"
          >
            BLOG
          </a>
          <a
            onClick={() => {
              handleRedirectEven();
              setOpenMenu(false);
            }}
            className="block hover:text-yellow-600"
          >
            SỰ KIỆN
          </a>
          <a
            onClick={() => {
              handleRedirectInfoVlearningPage();
              setOpenMenu(false);
            }}
            className="block hover:text-yellow-600"
          >
            THÔNG TIN
          </a>
          {infoUser?.maLoaiNguoiDung === "GV" && (
            <button
              onClick={() => navigate("/admin/quanlynguoidung")}
              className="w-full flex items-center justify-center gap-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded"
            >
              <SettingOutlined />
            </button>
          )}
          {/* Đăng nhập/Đăng xuất */}
          {infoUser ? (
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded"
            >
              ĐĂNG XUẤT
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded"
            >
              ĐĂNG NHẬP
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default HeaderPage;
