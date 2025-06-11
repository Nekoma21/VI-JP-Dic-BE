import User from "../models/user.js";
import Word from "../models/word.js";
import Kanji from "../models/kanji.js";

export const getDashboardStatsService = async () => {
  try {
    // Đếm tổng số người dùng
    const totalUsers = await User.countDocuments();

    // Đếm tổng số Hán tự (Kanji)
    const totalKanjis = await Kanji.countDocuments();

    // Đếm tổng số từ vựng
    const totalWords = await Word.countDocuments();

    return {
      totalUsers,
      totalKanjis,
      totalWords,
    };
  } catch (error) {
    console.error("Error in getDashboardStatsService:", error);
    throw new Error("Không thể lấy thống kê dashboard");
  }
};

export const getUserRegistrationChartService = async (periodMonths) => {
  try {
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(now.getMonth() - periodMonths);
    startDate.setDate(1); // Bắt đầu từ ngày 1 của tháng
    startDate.setHours(0, 0, 0, 0);

    // Aggregate pipeline để group theo tháng
    const pipeline = [
      {
        $match: {
          created_at: {
            $gte: startDate,
            $lte: now,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ];

    const registrationData = await User.aggregate(pipeline);

    // Tạo mảng đầy đủ các tháng trong khoảng thời gian
    const months = [];
    const current = new Date(startDate);

    while (current <= now) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;

      // Tìm dữ liệu cho tháng hiện tại
      const monthData = registrationData.find(
        (item) => item._id.year === year && item._id.month === month
      );

      months.push({
        label: `${month}/${year}`,
        month: month,
        year: year,
        count: monthData ? monthData.count : 0,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return {
      period: `${periodMonths} tháng`,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      data: months,
      total: months.reduce((sum, item) => sum + item.count, 0),
    };
  } catch (error) {
    console.error("Error in getUserRegistrationChartService:", error);
    throw new Error("Không thể lấy dữ liệu biểu đồ người dùng");
  }
};
