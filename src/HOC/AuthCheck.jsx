import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";

export default function AuthCheck({
  children,
  isNeedLogin,
  requireAdmin = false,
}) {
  const navigate = useNavigate();
  const { infoUser } = useSelector((state) => state.userSlice);
  //cấm về login khi đã đăng nhập
  if (infoUser && !isNeedLogin) {
    return <Navigate to="/" replace />;
  }
  // Nếu chưa đăng nhập thì chuyển hướng về login
  if (!infoUser && isNeedLogin) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    // Nếu yêu cầu quyền Admin nhưng user không phải admin
    if (requireAdmin && infoUser?.maLoaiNguoiDung !== "GV") {
      navigate("/");
    }
  }, [navigate, infoUser, requireAdmin]);

  // Nếu có đăng nhập, hiển thị children
  return <>{children}</>;
}
