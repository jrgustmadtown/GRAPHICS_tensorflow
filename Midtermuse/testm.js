context.strokeStyle = "black";
context.save();

context.beginPath();
context.moveTo(20,20);
context.strokeStyle = "red";
context.lineTo(100,20);
context.strokeStyle = "green";
context.stroke();

context.lineTo(60,80);
context.strokeStyle = "blue";
context.stroke();

context.restore();

context.beginPath();
context.moveTo(60,80);
context.lineTo(20,20);
context.stroke();
context.strokeStyle = "purple";
