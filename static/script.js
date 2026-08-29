document.addEventListener("DOMContentLoaded", function () {

    const leaves = document.querySelectorAll(".leaf");

    const formModal = document.getElementById("form-modal");
    const messageModal = document.getElementById("message-modal");

    const closeForm = document.getElementById("close-form");
    const closeMessage = document.getElementById("close-message");

    const form = document.getElementById("kindness-form");

    const leafNumberInput =
        document.getElementById("leaf-number");

    const errorText =
        document.getElementById("form-error");

    const messageText =
        document.getElementById("message-text");


    // =========================
    // OPEN LEAF
    // =========================

    leaves.forEach(function (leaf) {

        leaf.addEventListener("click", function () {

            const leafNumber =
                leaf.dataset.leaf;

            // If leaf already has a message,
            // show the message instead.
            if (leaf.classList.contains("used")) {

                const message =
                    leaf.messageData;

                showMessage(message);

                return;
            }


            // Otherwise open the form.

            leafNumberInput.value =
                leafNumber;

            errorText.textContent = "";

            form.reset();

            leafNumberInput.value =
                leafNumber;

            formModal.classList.add("show");

        });

    });


    // =========================
    // CLOSE FORM
    // =========================

    closeForm.addEventListener("click", function () {

        formModal.classList.remove("show");

    });


    // =========================
    // CLOSE MESSAGE
    // =========================

    closeMessage.addEventListener("click", function () {

        messageModal.classList.remove("show");

    });


    // =========================
    // CLICK OUTSIDE MODAL
    // =========================

    formModal.addEventListener("click", function (event) {

        if (event.target === formModal) {

            formModal.classList.remove("show");

        }

    });


    messageModal.addEventListener("click", function (event) {

        if (event.target === messageModal) {

            messageModal.classList.remove("show");

        }

    });


    // =========================
    // SUBMIT
    // =========================

    form.addEventListener("submit", async function (event) {

        event.preventDefault();


        const name =
            document.getElementById("name").value.trim();

        const major =
            document.getElementById("major").value.trim();

        const sentence =
            document.getElementById("sentence").value.trim();

        const leafNumber =
            leafNumberInput.value;


        errorText.textContent = "";


        const submitButton =
            form.querySelector(".submit-button");

        submitButton.disabled = true;


        try {

            const response = await fetch("/submit", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name: name,

                    major: major,

                    sentence: sentence,

                    leaf_number: leafNumber

                })

            });


            const data =
                await response.json();


            if (!response.ok) {

                errorText.textContent =
                    data.error || "خطایی رخ داد.";

                submitButton.disabled = false;

                return;
            }


            // =========================
            // SUCCESS
            // =========================

            const message =
                data.message;


            const leaf =
                document.querySelector(
                    `.leaf[data-leaf="${message.leaf_number}"]`
                );


            if (leaf) {

                // Save message on leaf

                leaf.messageData =
                    message;


                // Put sentence on leaf

                const text =
                    leaf.querySelector("span");

                text.textContent =
                    message.sentence;


                // Mark leaf as used

                leaf.classList.add("used");

            }


            // Close form

            formModal.classList.remove("show");


            // Reset

            form.reset();


            // Show success message

            showMessage(message);


        } catch (error) {

            console.error(error);

            errorText.textContent =
                "ارتباط با سرور برقرار نشد.";

        }


        submitButton.disabled = false;

    });


    // =========================
    // SHOW MESSAGE
    // =========================

    function showMessage(message) {

        messageText.innerHTML = `

            <div class="message-name">
                ${escapeHtml(message.name)}
            </div>

            <div class="message-major">
                ${escapeHtml(message.major)}
            </div>

            <div class="message-sentence">
                «${escapeHtml(message.sentence)}»
            </div>

        `;

        messageModal.classList.add("show");

    }


    // =========================
    // SECURITY
    // =========================

    function escapeHtml(text) {

        const div =
            document.createElement("div");

        div.textContent =
            text;

        return div.innerHTML;

    }


    // =========================
    // LOAD EXISTING MESSAGES
    // =========================

    async function loadMessages() {

        try {

            const response =
                await fetch("/messages");

            const messages =
                await response.json();


            messages.forEach(function (message) {

                const leaf =
                    document.querySelector(
                        `.leaf[data-leaf="${message.leaf_number}"]`
                    );


                if (!leaf) {
                    return;
                }


                leaf.messageData =
                    message;


                const text =
                    leaf.querySelector("span");


                text.textContent =
                    message.sentence;


                leaf.classList.add("used");

            });


        } catch (error) {

            console.error(
                "Could not load messages:",
                error
            );

        }

    }


    // Load database messages
    // when the page starts.

    loadMessages();

});