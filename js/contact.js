document.getElementById("contactForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const inputs = e.target.elements;

  const data = {
    name: inputs[0].value,
    email: inputs[1].value,
    subject: inputs[2].value,
    message: inputs[3].value
  };

  try {
    const response = await fetch("http://localhost:3000/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    document.getElementById("statusMsg").innerText = result.message;
    e.target.reset();
  } catch (error) {
    document.getElementById("statusMsg").innerText = "Error sending message";
  }
});
