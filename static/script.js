let timer;

let remainingSeconds = 25 * 60;

let isRunning = false;

let isPaused = false;


// =========================
// DISPLAY TIMER
// =========================

function displayTime() {

    let minutes = Math.floor(remainingSeconds / 60);

    let seconds = remainingSeconds % 60;

    minutes = String(minutes).padStart(2, "0");

    seconds = String(seconds).padStart(2, "0");

    document.getElementById("timer").textContent =
        minutes + ":" + seconds;
}


// =========================
// START FOCUS
// =========================

function startFocus() {

    const task =
        document.getElementById("task").value.trim();

    const duration =
        Number(document.getElementById("duration").value);


    if (task === "") {

        alert("Please enter what you want to focus on.");

        return;
    }


    if (duration <= 0) {

        alert("Please enter a valid focus time.");

        return;
    }


    // =========================
    // GENERATE AI PLAN
    // =========================

    fetch("/generate-plan", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            task: task,
            duration: duration
        })

    })

    .then(response => {

        if (!response.ok) {

            throw new Error("AI request failed.");

        }

        return response.json();

    })

    .then(data => {

        let plan = data.plan || "";


        // Fix escaped new lines

        plan = plan.replace(/\\n/g, "\n");


        // Fix escaped characters

        plan = plan.replace(/\\:/g, ":");

        plan = plan.replace(/\\-/g, "-");

        plan = plan.replace(/\\\./g, ".");


        // Remove backticks

        plan = plan.replace(/`/g, "");


        // Convert Markdown bold to HTML

        plan = plan.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


        // Convert line breaks to HTML

        plan = plan.replace(/\n/g, "<br>");


        // Display AI plan

        document.getElementById("aiPlan").innerHTML =
            "<h3>🤖 AI Focus Plan</h3>" +
            "<div>" + plan + "</div>";

    })

    .catch(error => {

        console.error(error);

        document.getElementById("aiPlan").innerHTML =
            "<h3>🤖 AI Focus Plan</h3>" +
            "<div>AI plan could not be generated.</div>";

    });


    // =========================
    // START TIMER
    // =========================

    clearInterval(timer);

    remainingSeconds = duration * 60;

    isRunning = true;

    isPaused = false;


    document.getElementById("pauseBtn").textContent =
        "⏸️ Pause";


    document.getElementById("status").textContent =
        "🔒 Focus session active: " + task;


    displayTime();


    timer = setInterval(function () {

        if (!isPaused) {

            remainingSeconds--;

            displayTime();


            if (remainingSeconds <= 0) {

                clearInterval(timer);

                isRunning = false;

                document.getElementById("status").textContent =
                    "🎉 Focus session completed!";

                alert(
                    "🎉 Great job! Your focus session is complete!"
                );

            }

        }

    }, 1000);

}


// =========================
// PAUSE / RESUME
// =========================

function pauseFocus() {

    if (!isRunning) {

        return;
    }


    isPaused = !isPaused;


    if (isPaused) {

        document.getElementById("pauseBtn").textContent =
            "▶️ Resume";

        document.getElementById("status").textContent =
            "⏸️ Focus session paused";

    } else {

        document.getElementById("pauseBtn").textContent =
            "⏸️ Pause";

        const task =
            document.getElementById("task").value.trim();

        document.getElementById("status").textContent =
            "🔒 Focus session active: " + task;

    }

}


// =========================
// STOP SESSION
// =========================

function stopFocus() {

    if (!isRunning) {

        return;
    }


    const confirmStop = confirm(
        "Are you sure you want to stop your focus session?"
    );


    if (!confirmStop) {

        return;
    }


    clearInterval(timer);

    isRunning = false;

    isPaused = false;

    remainingSeconds = 0;

    displayTime();


    document.getElementById("pauseBtn").textContent =
        "⏸️ Pause";


    document.getElementById("status").textContent =
        "🛑 Focus session stopped";

}


// =========================
// INITIAL TIMER
// =========================

displayTime();