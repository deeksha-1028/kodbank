async function askAI() {

  const input = document.getElementById("aiInput");
  const replyDiv = document.getElementById("aiReply");

  const message = input.value.trim();

  if (!message) {
    replyDiv.innerText = "Please enter a question.";
    return;
  }

  replyDiv.innerText = "Thinking...";

  try {
    const response = await fetch("/ask-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (data.success) {
      replyDiv.innerText = data.reply;
    } else {
      replyDiv.innerText = "AI request failed.";
    }

  } catch (error) {
    replyDiv.innerText = "Server error.";
  }

  input.value = "";
}

function logout() {
  window.location.href = "/login.html";
}