async function checkBalance() {
  const res = await fetch("/api/balance", {
    method: "GET",
    credentials: "include"
  });

  const data = await res.json();

  if (res.ok) {
    const balanceEl = document.getElementById("balance");
    balanceEl.innerText = "₹ " + data.balance;
    launchConfetti();
  } else {
    alert("Session expired. Please login again.");
    window.location.href = "/login.html";
  }
}

function logout() {
  document.cookie = "token=; Max-Age=0";
  window.location.href = "/login.html";
}

function launchConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];

  for (let i = 0; i < 150; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 8 + 4,
      speed: Math.random() * 3 + 2,
      color: `hsl(${Math.random()*360},100%,50%)`
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      p.y += p.speed;
      if (p.y > canvas.height) p.y = 0;
    });

    requestAnimationFrame(draw);
  }

  draw();

  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 4000);
}