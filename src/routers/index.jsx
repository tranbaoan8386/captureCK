import { Route } from "react-router-dom";
import HomePage from "../pages/home";
import KhoaHocDetail from "../pages/learning-detail";
import HomeTemplate from "../templates/HomeTemplate";
import AuthTemplate from "../templates/AuthTemplate";
import LoginPage from "../pages/login";

// 🧩 Giữ lại tất cả route user từ master
import DanhMucPage from "../pages/category";
import KhoaHocPhanTrangPage from "../pages/khoahocphantrang/ListKhoaHocPhanTrang";
import InfoUser from "../pages/infoUser";
import InfoKhoaHocUser from "../pages/infoUser/components/infoKhoaHocUser";
import InfoUserUpdate from "../pages/infoUser/components/infoUserUpdate";
import BlogListPage from "../pages/blog";
import EvenPage from "../pages/even";
import InfoElerningPage from "../pages/infoElerning";

// 🧩 Thêm route admin từ nhánh admin
import AdminTemplate from "../templates/AdminTemplate";
import UserManagementPage from "../pages/admin/UserManagementPage";
import CourseManagementPage from "../pages/admin/CourseManagementPage";

import AuthCheck from "../HOC/AuthCheck";

const routers = [
  // Trang người dùng (Home)
  {
    path: "",
    element: <HomeTemplate />,
    child: [
      { path: "", element: <HomePage /> },
      {
        path: "/detail/:khoahocId",
        element: (
          <AuthCheck isNeedLogin={true}>
            <KhoaHocDetail />
          </AuthCheck>
        ),
      },
      {
        path: "/danhmuckhoahoc/:danhmucId",
        element: (
          <AuthCheck isNeedLogin={true}>
            <DanhMucPage />
          </AuthCheck>
        ),
      },
      {
        path: "/khoahoc",
        element: (
          <AuthCheck isNeedLogin={true}>
            <KhoaHocPhanTrangPage />
          </AuthCheck>
        ),
      },
      {
        path: "/infoUser",
        element: (
          <AuthCheck isNeedLogin={true}>
            <InfoUser />
          </AuthCheck>
        ),
      },
      {
        path: "/info-khoa-hoc-user",
        element: (
          <AuthCheck isNeedLogin={true}>
            <InfoKhoaHocUser />
          </AuthCheck>
        ),
      },
      {
        path: "/info-update",
        element: (
          <AuthCheck isNeedLogin={true}>
            <InfoUserUpdate />
          </AuthCheck>
        ),
      },
      {
        path: "/blog",
        element: (
          <AuthCheck isNeedLogin={true}>
            <BlogListPage />
          </AuthCheck>
        ),
      },
      {
        path: "/event",
        element: (
          <AuthCheck isNeedLogin={true}>
            <EvenPage />
          </AuthCheck>
        ),
      },
      {
        path: "/thongtin",
        element: (
          <AuthCheck isNeedLogin={true}>
            <InfoElerningPage />
          </AuthCheck>
        ),
      },
    ],
  },

  // Trang đăng nhập
  {
    path: "",
    element: <AuthTemplate />,
    child: [
      {
        path: "/login",
        element: (
          <AuthCheck isNeedLogin={false}>
            <LoginPage />
          </AuthCheck>
        ),
      },
    ],
  },

  // Trang admin (thêm từ nhánh admin)
  {
    path: "/admin",
    element: (
      <AuthCheck requireAdmin isNeedLogin={true}>
        <AdminTemplate />
      </AuthCheck>
    ),
    child: [
      { index: true, element: <div>Trang chủ admin</div> },
      { path: "quanlynguoidung", element: <UserManagementPage /> },
      { path: "quanlykhoahoc", element: <CourseManagementPage /> },
    ],
  },
];

export const renderRoutes = () => {
  return routers.map((template, index) => {
    return (
      <Route key={index} path={template.path} element={template.element}>
        {template.child.map((item, indexChild) => {
          return (
            <Route key={indexChild} path={item.path} element={item.element} />
          );
        })}
      </Route>
    );
  });
};
