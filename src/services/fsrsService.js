import { StatusCodes } from "http-status-codes";
import {
  createEmptyCard,
  formatDate,
  fsrs,
  generatorParameters,
  Rating,
} from "ts-fsrs";

const demoFsrs = async () => {
  const params = generatorParameters({
    enable_fuzz: true,
    enable_short_term: true,
  });
  const scheduler = fsrs(params);
  try {
    const card = createEmptyCard(new Date("2022-02-01T10:00:00"));
    const now = new Date("2022-02-02T10:00:00");

    const scheduling_cards = Array.from(scheduler.repeat(card, now));

    const result = scheduling_cards.map((item) => {
      const grade = item.log.rating;
      const { log, card } = item;
      return {
        grade: Rating[grade],
        card: {
          ...card,
          due: formatDate(card.due),
          last_review: formatDate(new Date(card.last_review)),
        },
        log: {
          ...log,
          review: formatDate(new Date(log.review)),
        },
      };
    });

    return {
      status: StatusCodes.OK,
      data: result,
      message: "Lấy lịch học thành công",
    };
  } catch (error) {
    throw error;
  }
};

export const fsrsService = {
  demoFsrs,
};
