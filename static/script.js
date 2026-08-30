document.addEventListener("DOMContentLoaded", function () {


    const leavesContainer =
        document.getElementById("leaves-container");


    const addLeaf =
        document.getElementById("add-leaf");


    const formModal =
        document.getElementById("form-modal");


    const messageModal =
        document.getElementById("message-modal");


    const closeForm =
        document.getElementById("close-form");


    const closeMessage =
        document.getElementById("close-message");


    const form =
        document.getElementById("kindness-form");


    const errorText =
        document.getElementById("form-error");


    const messageText =
        document.getElementById("message-text");



    // =========================
    // ADD BUTTON
    // =========================

    addLeaf.addEventListener("click", function () {

        errorText.textContent = "";

        form.reset();

        formModal.classList.add("show");

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
    // CLICK OUTSIDE
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
    // CREATE LEAF
    // =========================
function createLeaf(message) {

    const leaf =
        document.createElement("div");


    leaf.className =
        "leaf used";


    leaf.dataset.leaf =
        message.leaf_number;


    // =========================
    // POSITION
    // =========================

    leaf.style.left =
        message.position_x + "%";


    leaf.style.top =
        message.position_y + "%";


    // =========================
    // NATURAL SIZE
    // =========================

    leaf.style.width =
        message.leaf_size + "%";


    // =========================
    // NATURAL ROTATION
    // =========================

    leaf.style.setProperty(
        "--leaf-rotation",
        message.leaf_rotation + "deg"
    );

    leaf.style.setProperty(
    "--sway-duration",
    (4 + Math.random() * 3) + "s"
);

leaf.style.setProperty(
    "--sway-delay",
    (-Math.random() * 5) + "s"
);


    leaf.messageData =
        message;


    leaf.innerHTML = `

        <img
            src="/static/images/leaf.png"
            alt="برگ مهربانی"
        >

        <span>
            ${escapeHtml(truncateSentence(message.sentence))}
        </span>

    `;


    leaf.addEventListener(
        "click",
        function () {

            showMessage(message);

        }
    );


    leavesContainer.appendChild(leaf);
}

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
    // SUBMIT
    // =========================

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document.getElementById("name")
                .value
                .trim();


            const major =
                document.getElementById("major")
                .value
                .trim();


            const sentence =
                document.getElementById("sentence")
                .value
                .trim();


            errorText.textContent = "";


            const submitButton =
                form.querySelector(".submit-button");


            submitButton.disabled = true;


            try {


                const response =
                    await fetch(
                        "/submit",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,

                                major: major,

                                sentence: sentence

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    errorText.textContent =
                        data.error ||
                        "خطایی رخ داد.";

                    submitButton.disabled = false;

                    return;

                }


                // =========================
                // CREATE THE NEW LEAF
                // =========================

                createLeaf(data.message);


                // Close form

                formModal.classList.remove("show");


                // Reset form

                form.reset();


                // Show the new message

                showMessage(data.message);


            }


            catch (error) {

                console.error(error);

                errorText.textContent =
                    "ارتباط با سرور برقرار نشد.";

            }


            submitButton.disabled = false;

        }
    );



    // =========================
    // LOAD EXISTING LEAVES
    // =========================

    async function loadMessages() {


        try {


            const response =
                await fetch("/messages");


            const messages =
                await response.json();


            messages.forEach(function (message) {

                createLeaf(message);

            });


        }


        catch (error) {

            console.error(
                "Could not load messages:",
                error
            );

        }

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
function truncateSentence(sentence) {

    const maxLength = 47;

    if (sentence.length <= maxLength) {
        return sentence;
    }

    return sentence.substring(0, maxLength).trim() + "...";
}


    // Load existing leaves

    loadMessages();

});
