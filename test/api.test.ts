import { QuartzCronExpression } from "@/quartz/syntax";
import { CronixExpression, CronixParser } from "@/cronix";
import CronixMode from "@/cronix/CronixMode";
import { EarlyExitException, ILexingError, NotAllInputParsedException } from "chevrotain";

describe("CronixParser Cron mode", () => {
  let parser: CronixParser;

  beforeAll(() => {
    parser = new CronixParser();
  });

  describe("parse", () => {

    test("Expression object should parse", () => {
      // Given
      // Everyday at 04:05
      const expression: CronixExpression = {
        minute: "5",
        hour: "4"
      };
      // When
      const parsed = parser.parse(expression);
      // Then
      expect(parsed.minute.value()).toBe("5");
      expect(parsed.hour.value()).toBe("4");
      expect(parsed.dow.value()).toBe("*");
      expect(parsed.month.value()).toBe("*");
      expect(parsed.dom.value()).toBe("*");
    });

    test("String expression should parse", () => {
      // Given
      // Everyday at 04:05
      const expression = "5 4 * * *";
      // When
      const parsed = parser.parse(expression);
      // Then
      expect(parsed.minute.value()).toBe("5");
      expect(parsed.hour.value()).toBe("4");
      expect(parsed.dow.value()).toBe("*");
      expect(parsed.month.value()).toBe("*");
      expect(parsed.dom.value()).toBe("*");
    });

    test("Invalid string expression should fail", () => {
      // Given
      // Everyday at 04:05
      const expression = "5 4 * ABC *";
      // When
      const parsed = parser.parse(expression);
      // Then
      expect(parsed).toBeNull();
      expect(parser.errors.length).toBe(2);
      expect(parser.errors[0].name).toBe("LexingError");
      expect(parser.errors[1].innerException).toBeInstanceOf(EarlyExitException);
    });

    test("Jenkins specific token should fail", () => {
      // Given
      // Everyday at 04:05
      const expression = "5 4 * * H";
      // When
      const parsed = parser.parse(expression);
      // Then
      expect(parsed).toBeNull();
      expect(parser.errors.length).toBe(2);
      expect(parser.errors[0].name).toBe("LexingError");
      expect(parser.errors[1].innerException).toBeInstanceOf(EarlyExitException);
    });

    test("Quartz expression should parse with undefined field and unexpected result", () => {
      // Given
      // Everyday at 04:05
      const expression = "0 5 4 * * ?";
      // When
      const parsed: QuartzCronExpression = parser.parse(expression);
      // Then
      expect(parsed.second).toBeUndefined();
      expect(parsed.minute.value()).toBe("0");
      expect(parsed.hour.value()).toBe("5");
      expect(parsed.dom.value()).toBe("4");
      expect(parsed.month.value()).toBe("*");
      expect(parsed.dow.value()).toBe("*");
      expect(parsed.year).toBeUndefined();
    });
  });
  describe("parseField", () => {
    test("should parse a simple expression", () => {
      // Given
      const expression = "4-10/2";
      // When
      const parsed = parser.parseField(expression);
      // Then
      expect(parsed.value()).toBe(expression);
    });

    test("Quartz day of week should fail to parse", () => {
      // Given
      const expression = "MON#4";
      // When
      const parsed = parser.parseField(expression);
      // Then
      expect(parsed).toBeNull();
      expect(parser.errors.length).toBe(2);
      expect(parser.errors[0].name).toBe("LexingError");
      expect(parser.errors[1].innerException).toBeInstanceOf(EarlyExitException);
    });
  });
});

describe("CronixParser Quartz mode", () => {
  let parser: CronixParser;

  beforeAll(() => {
    parser = new CronixParser({ mode: CronixMode.QUARTZ });
  });
  describe("parse", () => {
    test("expression object should parse to default values", () => {
      // Given
      // Everyday at 04:05
      const expression: CronixExpression = {
        minute: "5",
        hour: "4"
      };
      // When
      const parsed: QuartzCronExpression = parser.parse(expression);
      // Then
      expect(parsed.second.value()).toBe("0");
      expect(parsed.minute.value()).toBe("5");
      expect(parsed.hour.value()).toBe("4");
      expect(parsed.dow.value()).toBe("*");
      expect(parsed.month.value()).toBe("*");
      expect(parsed.dom.value()).toBe("*");
      expect(parsed.year.value()).toBe("*");
    });

    test("expression object with no default values should parse", () => {
      // Given
      // Everyday at 04:05
      const expression: CronixExpression = {
        second: "12",
        minute: "5",
        hour: "4",
        dayOfWeek: "?",
        dayOfMonth: "*/3",
        month: "*/2",
        year: "*/2"
      };
      // When
      const parsed: QuartzCronExpression = parser.parse(expression);
      // Then
      expect(parsed.second.value()).toBe("12");
      expect(parsed.minute.value()).toBe("5");
      expect(parsed.hour.value()).toBe("4");
      expect(parsed.dow.value()).toBe("?");
      expect(parsed.month.value()).toBe("*/2");
      expect(parsed.dom.value()).toBe("*/3");
      expect(parsed.year.value()).toBe("*/2");
    });

    test("String expression without seconds should fail", () => {
      // Given
      // Everyday at 04:05
      const expression = "5 4 * * *";
      // When
      const parsed = parser.parse(expression);
      // Then
      expect(parsed).toBeNull();
      expect(parser.errors.length).toBe(1);
      expect(parser.errors[0].innerException).toBeInstanceOf(EarlyExitException);
    });

    test("Invalid string expression should fail", () => {
      // Given
      // Everyday at 04:05
      const expression = "5 4 * ABC *";
      // When
      const parsed = parser.parse(expression);
      // Then
      expect(parsed).toBeNull();
      expect(parser.errors.length).toBe(2);
      expect(parser.errors[0].name).toBe("LexingError");
      expect(parser.errors[1].innerException).toBeInstanceOf(EarlyExitException);
    });

    test("Jenkins expression should fail", () => {
      // Given
      // Everyday at 04:05
      const expression = "5 4 * * H";
      // When
      const parsed = parser.parse(expression);
      // Then
      expect(parsed).toBeNull();
      expect(parser.errors.length).toBe(2);
      expect(parser.errors[0].name).toBe("LexingError");
      expect(parser.errors[1].innerException).toBeInstanceOf(EarlyExitException);
    });

    test("Quartz expression should parse", () => {
      // Given
      // Everyday at 04:05
      const expression = "0 5 4 * * ?";
      // When
      const parsed: QuartzCronExpression = parser.parse(expression);
      // Then
      expect(parsed.second.value()).toBe("0");
      expect(parsed.minute.value()).toBe("5");
      expect(parsed.hour.value()).toBe("4");
      expect(parsed.dom.value()).toBe("*");
      expect(parsed.month.value()).toBe("*");
      expect(parsed.dow.value()).toBe("?");
      expect(parsed.year.value()).toBe("*");
    });
  });
  describe("parseField", () => {
    test("should parse a simple expression", () => {
      // Given
      const expression = "4-10/2";
      // When
      const parsed = parser.parseField(expression);
      // Then
      expect(parsed.value()).toBe(expression);
    });

    test("Quartz day of week should parse", () => {
      // Given
      const expression = "MON#4";
      // When
      const parsed = parser.parseField(expression);
      // Then
      expect(parsed.value()).toBe("MON#4");
    });
  });
});

describe("CronixParser Jenkins mode", () => {
  let parser: CronixParser;

  beforeAll(() => {
    parser = new CronixParser({ mode: CronixMode.JENKINS });
  });
  describe("parse", () => {


    test("expression object should parse", () => {
      // Given
      // Everyday at 04:05
      const expression: CronixExpression = {
        minute: "5",
        hour: "4"
      };
      // When
      const parsed = parser.parse(expression);
      // Then
      expect(parsed.minute.value()).toBe("5");
      expect(parsed.hour.value()).toBe("4");
      expect(parsed.dow.value()).toBe("*");
      expect(parsed.month.value()).toBe("*");
      expect(parsed.dom.value()).toBe("*");
    });

    test("String expression should parse", () => {
      // Given
      // Everyday at 04:05
      const expression = "5 4 * * *";
      // When
      const parsed = parser.parse(expression);
      // Then
      expect(parsed.minute.value()).toBe("5");
      expect(parsed.hour.value()).toBe("4");
      expect(parsed.dow.value()).toBe("*");
      expect(parsed.month.value()).toBe("*");
      expect(parsed.dom.value()).toBe("*");
    });

    test("Invalid string expression should fail", () => {
      // Given
      // Everyday at 04:05
      const expression = "5 4 * ABC *";
      // When
      const parsed = parser.parse(expression);
      // Then
      expect(parsed).toBeNull();
      expect(parser.errors.length).toBe(2);
      expect(parser.errors[0].name).toBe("LexingError");
      expect(parser.errors[1].innerException).toBeInstanceOf(EarlyExitException);
    });

    test("Jenkins expression should parse", () => {
      // Given
      // Everyday at 04:05
      const expression = "5 4 * * H";
      // When
      const parsed = parser.parse(expression);
      // Then
      expect(parsed.minute.value()).toBe("5");
      expect(parsed.hour.value()).toBe("4");
      expect(parsed.dom.value()).toBe("*");
      expect(parsed.month.value()).toBe("*");
      expect(parsed.dow.value()).toBe("H");
    });

    test("Quartz expression should parse with undefined field", () => {
      // Given
      // Everyday at 04:05
      const expression = "0 5 4 * * ?";
      // When
      const parsed: QuartzCronExpression = parser.parse(expression);
      // Then
      expect(parsed.second).toBeUndefined();
      expect(parsed.minute.value()).toBe("0");
      expect(parsed.hour.value()).toBe("5");
      expect(parsed.dom.value()).toBe("4");
      expect(parsed.month.value()).toBe("*");
      expect(parsed.dow.value()).toBe("*");
      expect(parsed.year).toBeUndefined();
    });
  });
  describe("parseField", () => {
    test("should parse a simple expression", () => {
      // Given
      const expression = "4-10/2";
      // When
      const parsed = parser.parseField(expression);
      // Then
      expect(parsed.value()).toBe(expression);
    });

    test("Quartz day of week should ignore Quartz specific tokens", () => {
      // Given
      const expression = "MON#4";
      // When
      const parsed = parser.parseField(expression);
      // Then
      expect(parsed).toBeNull();
      expect(parser.errors.length).toBe(2);
      expect(parser.errors[0].name).toBe("LexingError");
      expect(parser.errors[1].innerException).toBeInstanceOf(EarlyExitException);
    });
  });
});
