module.exports = function createStatementData(invoice, plays) {
  const statemetData = {};
  statemetData.customer = invoice.customer;
  statemetData.performances = invoice.performances.map(enrichPerformance);
  statemetData.totalAmount = totalAmount(statemetData);
  statemetData.totalVolumeCredits = totalVolumeCredits(statemetData);
  return statemetData;

  function enrichPerformance(aPerformance) {
    const calculator = createPerformanceCalculator(
      aPerformance,
      playFor(aPerformance)
    );
    const result = Object.assign({}, aPerformance);
    result.play = calculator.play;
    result.amount = calculator.amount;
    result.volumeCredits = calculator.volumeCredits;
    return result;

    function playFor(aPerformance) {
      return plays[aPerformance.playID];
    }
  }

  function totalAmount(data) {
    return data.performances.reduce((total, perf) => total + perf.amount, 0);
  }

  function totalVolumeCredits(data) {
    return data.performances.reduce(
      (total, perf) => total + perf.volumeCredits,
      0
    );
  }
};

function createPerformanceCalculator(aPerformance, aPlay) {
  switch (aPlay.type) {
    case "tragedy":
      return new TragedyCalculator(aPerformance, aPlay);
    case "comedy":
      return new ComedyCalculator(aPerformance, aPlay);
    default:
      throw new Error(`알 수 없는 장르: ${aPlay.type}`);
  }
}

class PerformanceCalculator {
  constructor(aPerformance, aPlay) {
    this.performance = aPerformance;
    this.play = aPlay;
  }

  get amount() {
    throw new Error("서브클래스에서 구현할 것");
  }

  get volumeCredits() {
    return Math.max(this.performance.audience - 30, 0);
  }
}

class TragedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 40000;
    if (this.performance.audience > 30) {
      result += 1000 * (this.performance.audience - 30);
    }
    return result;
  }
}

class ComedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 30000;
    if (this.performance.audience > 20) {
      result += 10000 + 500 * (this.performance.audience - 20);
    }
    result += 300 * this.performance.audience;
    return result;
  }

  get volumeCredits() {
    return super.volumeCredits + Math.floor(this.performance.audience / 5);
  }
}
