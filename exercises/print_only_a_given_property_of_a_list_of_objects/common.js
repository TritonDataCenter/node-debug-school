var minValue = 4242;
var maxValue = minValue + 10;
var expectedTotal = 0;

exports.minValue = minValue;
exports.maxValue = maxValue;

for (var value = minValue; value < maxValue; ++value) {
 expectedTotal += value;
}

exports.expectedTotal = expectedTotal;
