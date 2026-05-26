// assets/js/chatbot.js
// Stable Step-by-Step Enquiry Chatbot Flow

document.addEventListener('DOMContentLoaded', () => {
    const GOOGLE_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwg-LXvjlOYOMQdqhylrBHt-uYoH_0uPgTtaklOgzrskaKs-rom-UoCVbHhJVQbXwi0/exec";

    const launcher = document.getElementById('chatbotLauncher');
    const panel = document.getElementById('chatbotPanel');
    const closeBtn = document.getElementById('chatbotClose');
    const messagesContainer = document.getElementById('chatbotMessages');
    const inputWrap = document.getElementById('chatbotInputWrap');
    const sendBtn = document.getElementById('chatbotSendBtn');

    if (!launcher || !panel || !closeBtn || !sendBtn) return;

    let isOpen = false;
    let currentStep = 0;
    const data = {
        name: '',
        phone: '',
        email: '',
        service: '',
        budget: '',
        message: ''
    };

    // Toggle Panel Open/Close
    launcher.addEventListener('click', () => {
        isOpen = !isOpen;
        panel.classList.toggle('active', isOpen);
        if (isOpen) {
            if (messagesContainer.children.length === 0) {
                initChat();
            }
            setTimeout(() => {
                const input = document.getElementById('chatbotTextInput') || document.getElementById('chatbotSelectInput');
                if (input) input.focus();
            }, 300);
        }
    });

    closeBtn.addEventListener('click', () => {
        isOpen = false;
        panel.classList.remove('active');
    });

    sendBtn.addEventListener('click', handleUserInput);

    function initChat() {
        currentStep = 0;
        addBotMessage("Namaste! 👋 Main Shreshth ka AI Assistant hu. Main aapki enquiry details collect karne me help karunga. Sabse pehle, aapka name kya hai?");
        setupTextInput("Aapka Naam...", data.name);
    }

    function addBotMessage(text) {
        const indicator = showTypingIndicator();
        setTimeout(() => {
            indicator.remove();
            const msg = document.createElement('div');
            msg.className = 'chatbot-msg-bubble bot';
            msg.innerHTML = text;
            messagesContainer.appendChild(msg);
            scrollToBottom();
        }, 800);
    }

    function addUserMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'chatbot-msg-bubble user';
        msg.textContent = text;
        messagesContainer.appendChild(msg);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const ind = document.createElement('div');
        ind.className = 'chatbot-typing-indicator';
        ind.innerHTML = `
            <div class="chatbot-typing-dot"></div>
            <div class="chatbot-typing-dot"></div>
            <div class="chatbot-typing-dot"></div>
        `;
        messagesContainer.appendChild(ind);
        scrollToBottom();
        return ind;
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function setupTextInput(placeholder, value = "", isTextArea = false) {
        sendBtn.style.display = 'flex';
        sendBtn.removeAttribute('disabled');
        if (isTextArea) {
            inputWrap.innerHTML = `<textarea class="chatbot-text-input" id="chatbotTextInput" placeholder="${placeholder}" autocomplete="off">${value}</textarea>`;
        } else {
            inputWrap.innerHTML = `<input type="text" class="chatbot-text-input" id="chatbotTextInput" placeholder="${placeholder}" value="${value}" autocomplete="off">`;
        }
        const newInput = document.getElementById('chatbotTextInput');
        newInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !isTextArea) handleUserInput();
        });
        setTimeout(() => newInput.focus(), 100);
    }

    function setupSelectInput(options, selectedValue = "") {
        sendBtn.style.display = 'flex';
        sendBtn.removeAttribute('disabled');
        let html = `<select class="chatbot-select-input" id="chatbotSelectInput">`;
        options.forEach(opt => {
            const isSelected = opt === selectedValue ? "selected" : "";
            html += `<option value="${opt}" ${isSelected}>${opt}</option>`;
        });
        html += `</select>`;
        inputWrap.innerHTML = html;
        const select = document.getElementById('chatbotSelectInput');
        setTimeout(() => select.focus(), 100);
    }

    function setupButtonInput() {
        sendBtn.style.display = 'none';
        inputWrap.innerHTML = `
            <div class="chatbot-btn-container">
                <button class="chatbot-opt-btn primary" id="btnSubmitEnquiry">Submit Enquiry</button>
                <button class="chatbot-opt-btn" id="btnEditEnquiry">Edit Details</button>
            </div>
        `;
        document.getElementById('btnSubmitEnquiry').addEventListener('click', submitEnquiry);
        document.getElementById('btnEditEnquiry').addEventListener('click', editDetails);
    }

    function handleUserInput() {
        let value = "";
        const textEl = document.getElementById('chatbotTextInput');
        const selectEl = document.getElementById('chatbotSelectInput');

        if (textEl) {
            value = textEl.value.trim();
        } else if (selectEl) {
            value = selectEl.value;
        }

        if (!value) return;

        // Validation
        if (currentStep === 1) { // Phone validation
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length < 10) {
                addBotMessage("⚠️ <b>Invalid Phone:</b> Please valid 10-digit number type karein.");
                setupTextInput("Phone/WhatsApp Number...", value);
                return;
            }
        } else if (currentStep === 2) { // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                addBotMessage("⚠️ <b>Invalid Email:</b> Please valid email ID type karein.");
                setupTextInput("Email ID...", value);
                return;
            }
        }

        addUserMessage(value);

        if (currentStep === 0) {
            data.name = value;
            currentStep = 1;
            addBotMessage(`Aap se milkar khushi hui, <b>${data.name}</b>! Mujhe aapka WhatsApp ya Phone number mil sakta hai? Hum aapse directly connect kar sakein.`);
            setupTextInput("Phone/WhatsApp Number...", data.phone);
        } else if (currentStep === 1) {
            data.phone = value;
            currentStep = 2;
            addBotMessage("Awesome! Aur aapki primary Email ID kya hai?");
            setupTextInput("Email ID...", data.email);
        } else if (currentStep === 2) {
            data.email = value;
            currentStep = 3;
            addBotMessage("Thank you! Aap kis service ke liye enquiry karna chahte hain? Dropdown se select karein.");
            setupSelectInput([
                "Full Stack Development",
                "Automation & Integrations (n8n)",
                "AI Chatbots & Agents",
                "SaaS/CRM Web Apps",
                "UI/UX Design / Figma",
                "Other Consulting"
            ], data.service);
        } else if (currentStep === 3) {
            data.service = value;
            currentStep = 4;
            addBotMessage("Got it! Project ka estimated budget range kya hai? (INR)");
            setupSelectInput([
                "< ₹10k (Small Task)",
                "₹10k - ₹30k (Basic App)",
                "₹30k - ₹50k (Custom Build)",
                "₹50k - ₹1 Lakh (Advanced Platform)",
                "₹1 Lakh+ (Enterprise / SaaS)"
            ], data.budget);
        } else if (currentStep === 4) {
            data.budget = value;
            currentStep = 5;
            addBotMessage("Sahi hai! Ab thoda sa detail share karein ki aap exact kya banana chahte hain.");
            setupTextInput("Project Details...", data.message, true);
        } else if (currentStep === 5) {
            data.message = value;
            currentStep = 6;
            showSummary();
        }
    }

    function showSummary() {
        const summaryHtml = `
            <b>Aapki Enquiry Details:</b><br><br>
            👤 <b>Name:</b> ${data.name}<br>
            📞 <b>Phone:</b> ${data.phone}<br>
            📧 <b>Email:</b> ${data.email}<br>
            💼 <b>Service:</b> ${data.service}<br>
            💰 <b>Budget:</b> ${data.budget}<br>
            📝 <b>Message:</b> ${data.message}<br><br>
            Kya ye details sahi hain? Please review karke submit karein.
        `;
        addBotMessage(summaryHtml);
        setupButtonInput();
    }

    function editDetails() {
        addUserMessage("Edit Details");
        currentStep = 0;
        addBotMessage("Teekh hai, aaiye details correct karte hain. Aapka name kya hai?");
        setupTextInput("Aapka Naam...", data.name);
    }

    function submitEnquiry() {
        addUserMessage("Submit Enquiry");

        const submitBtnElement = document.getElementById('btnSubmitEnquiry');
        const editBtnElement = document.getElementById('btnEditEnquiry');

        if (!GOOGLE_SHEET_WEB_APP_URL || GOOGLE_SHEET_WEB_APP_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE" || GOOGLE_SHEET_WEB_APP_URL.trim() === "") {
            console.error("Google Sheet URL is not configured.");
            addBotMessage("Google Sheet URL is not configured.");
            return;
        }

        addBotMessage("Submitting your enquiry...");

        if (submitBtnElement) submitBtnElement.disabled = true;
        if (editBtnElement) editBtnElement.disabled = true;

        console.log("Submitting enquiry", data);
        console.log("Web App URL", GOOGLE_SHEET_WEB_APP_URL);

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('phone', data.phone);
        formData.append('email', data.email);
        formData.append('service', data.service);
        formData.append('budget', data.budget);
        formData.append('message', data.message);
        formData.append('timestamp', new Date().toISOString());
        formData.append('source', "Portfolio Chatbot");

        fetch(GOOGLE_SHEET_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        })
        .then(() => {
            console.log("Fetch completed");
            addBotMessage("Your enquiry has been submitted successfully. Shresth will contact you soon.");
            sendBtn.style.display = 'none';
            inputWrap.innerHTML = `<span style="font-size:0.85rem;color:var(--green);font-weight:600;">Saved Successfully! ✅</span>`;
        })
        .catch(err => {
            console.error("Fetch failed", err);
            addBotMessage("Something went wrong. Please try again or contact directly on WhatsApp.");
            if (submitBtnElement) submitBtnElement.disabled = false;
            if (editBtnElement) editBtnElement.disabled = false;
        });
    }
});
