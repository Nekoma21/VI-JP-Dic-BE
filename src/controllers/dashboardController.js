import {
  getDashboardStatsService,
  getUserRegistrationChartService,
} from "../services/dashboardService.js";

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await getDashboardStatsService();

    res.status(200).json({
      success: true,
      data: stats,
      message: "Lấy thống kê dashboard thành công",
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê dashboard",
      error: error.message,
    });
  }
};

export const getUserRegistrationChart = async (req, res) => {
  try {
    const { period = "12" } = req.query;

    // Validate period
    const validPeriods = ["3", "6", "12", "24"];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Period không hợp lệ. Chỉ chấp nhận: 3, 6, 12, 24 tháng",
      });
    }

    const chartData = await getUserRegistrationChartService(parseInt(period));

    res.status(200).json({
      success: true,
      data: chartData,
      message: "Lấy dữ liệu biểu đồ thành công",
    });
  } catch (error) {
    console.error("Error getting user registration chart:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy dữ liệu biểu đồ",
      error: error.message,
    });
  }
};
