import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setListKhoaHoc } from "../../../stores/khoahoc";
import { khoahocService } from "../../../service/khoahocService";
import { Card, Rate, Pagination } from "antd";
import { useNavigate } from "react-router-dom";

const { Meta } = Card;

const ListKhoaHoc = () => {
  const dispatch = useDispatch();
  const listKhoaHoc = useSelector((state) => state.khoahocSlice.listKhoaHoc);
  console.log("listKhoaHoc", listKhoaHoc);
  const navigate = useNavigate();

  // State lưu page cho từng nhóm
  const [pageByCategory, setPageByCategory] = useState({});

  const fetchListKhoaHoc = async () => {
    try {
      const responseListKhoaHoc = await khoahocService.getListKhoaHoc();
      dispatch(setListKhoaHoc(responseListKhoaHoc.data));
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    fetchListKhoaHoc();
  }, []);

  const handleRedirectKhoaHocDetailPage = (khoahocId) => {
    console.log("khoahocId", khoahocId);
    //DI Chuyển qua trang chi tiết khóa học
    navigate(`/detail/${khoahocId}`);
  };

  // Gom khóa học theo danh mục
  const groupByCategory = {}; // object rỗng ban đầu

  listKhoaHoc.forEach((course) => {
    // Lấy tên danh mục, nếu không có thì dùng "Khác"
    const categoryName = course.danhMucKhoaHoc?.tenDanhMucKhoaHoc || "Khác";

    // Nếu object chưa có key này thì tạo mảng rỗng
    if (!groupByCategory[categoryName]) {
      groupByCategory[categoryName] = [];
    }

    // Thêm khóa học vào đúng nhóm
    groupByCategory[categoryName].push(course);
  });

  // Mỗi hàng chỉ hiện 4 item
  const pageSize = 4;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {Object.keys(groupByCategory).map((category) => {
        const courses = groupByCategory[category];
        const currentPage = pageByCategory[category] || 1;

        // Cắt dữ liệu theo page
        const startIndex = (currentPage - 1) * pageSize;
        const currentCourses = courses.slice(startIndex, startIndex + pageSize);

        return (
          <div key={category} className="mb-10">
            <h2 className="text-2xl font-bold mb-6 text-yellow-600">
              {category}
            </h2>

            {/* Card list: chỉ 1 hàng */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {currentCourses.map((course, index) => (
                <Card
                  onClick={() =>
                    handleRedirectKhoaHocDetailPage(course.maKhoaHoc)
                  }
                  key={index}
                  hoverable
                  cover={
                    <img
                      alt={course.tenKhoaHoc}
                      src={course.hinhAnh}
                      className="h-48 object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://canhme.com/wp-content/uploads/2018/09/Nodejs.png";
                      }}
                    />
                  }
                  className="rounded-2xl shadow-md"
                >
                  {/* Nhãn yêu thích */}
                  <span
                    className="
                    absolute top-2 -left-1 sm:top-2 sm:-left-1 md:top-2 md:-left-1 lg:top-5 lg:-left-1 z-10
                    bg-red-500 text-white text-xs px-2 py-1
                    before:content-[''] before:absolute before:left-0 before:-bottom-2
                    before:border-b-[10px] before:border-b-transparent
                    before:border-r-[5px] before:border-r-red-500
                    before:brightness-90
                  after:content-[''] after:absolute after:-top-0.5 after:-right-3
                  after:border-t-[12px] after:border-b-[12px] after:border-r-[12px]
                  after:border-t-red-500 after:border-b-red-500 after:border-r-transparent
                "
                  >
                    YÊU THÍCH
                  </span>
                  <span
                    className="
                      absolute top-45 -left-1 sm:top-45 sm:-left-1 md:top-45 md:-left-1 lg:top-45 lg:-left-1 lg:w-40
                      bg-teal-500 text-white text-xs px-6 py-1 pr-8
                      before:content-[''] before:absolute before:left-0 before:-bottom-2
                      before:border-b-[10px] before:border-b-transparent
                      before:border-r-[5px] before:border-r-teal-500
                      after:content-[''] after:absolute after:-top-0.5 after:-right-3
                      after:border-t-[12px] after:border-b-[12px] after:border-r-[12px]
                      after:border-t-teal-500 after:border-b-teal-500 after:border-r-transparent
                    "
                  >
                    {course.danhMucKhoaHoc?.tenDanhMucKhoaHoc || "Khóa học"}
                  </span>

                  {/* Giá */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-gray-400 line-through text-sm">
                        800.000đ
                      </span>
                      <span className="text-green-600 font-semibold text-lg">
                        400.000đ
                      </span>
                    </div>
                    <Rate
                      disabled
                      defaultValue={5}
                      className="text-yellow-500"
                    />
                  </div>
                  {/* Giảng viên */}
                  <div className="mt-2 text-sm text-gray-500">
                    Giảng viên: {course.nguoiTao?.hoTen}
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination cho từng nhóm */}
            {courses.length > pageSize && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={courses.length}
                  onChange={(page) =>
                    setPageByCategory((prev) => ({
                      ...prev,
                      [category]: page,
                    }))
                  }
                  showSizeChanger={false}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ListKhoaHoc;
