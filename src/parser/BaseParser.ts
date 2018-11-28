import { Parser, TokenVocabulary } from "chevrotain";
import { Comma, Dash, Identifier, Slash } from "../lexer";

export class BaseParser extends Parser {
  constructor(vocabulary: TokenVocabulary, invokedByChild: boolean = false) {
    super(vocabulary);
    if (!invokedByChild) {
      this.performSelfAnalysis();
    }
  }

  readonly cron = this.RULE("cron", () => this.SUBRULE(this.cronExpression));

  readonly cronExpression = this.RULE("cronExpression", () => {
    // Minutes
    this.SUBRULE1(this.expression, { LABEL: "minutes" });
    // Hours
    this.SUBRULE2(this.expression, { LABEL: "hours" });
    // Day of month
    this.SUBRULE3(this.expression, { LABEL: "dom" });
    // Month
    this.SUBRULE4(this.expression, { LABEL: "month" });
    // Day of week
    this.SUBRULE5(this.expression, { LABEL: "dow" });
  });

  readonly expression = this.RULE("expression", () => {
    this.AT_LEAST_ONE_SEP({
      SEP: Comma,
      DEF: () => this.SUBRULE(this.exprNotUnion)
    });
  });

  readonly exprNotUnion = this.RULE("exprNotUnion", () => {
    this.SUBRULE1(this.atomicExpr, { LABEL: "lhs" });
    this.OPTION({
      DEF: () => this.OR([{ ALT: () => this.SUBRULE2(this.interval) }, { ALT: () => this.SUBRULE2(this.range) }])
    });
  });

  readonly interval = this.RULE("interval", () => {
    this.CONSUME1(Slash);
    this.CONSUME2(Identifier, { LABEL: "rhs" });
  });

  readonly range = this.RULE("range", () => {
    this.CONSUME1(Dash);
    this.CONSUME2(Identifier, { LABEL: "rhs" });
  });

  readonly atomicExpr = this.RULE("atomicExpr", () => {
    this.CONSUME(Identifier);
  });
}