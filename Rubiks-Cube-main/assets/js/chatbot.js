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
    let isSubmitting = false;
    const leadData = {
        language: '',
        name: '',
        phone: '',
        email: '',
        service: '',
        budget: '',
        timeline: '',
        message: '',
        source: "Portfolio Chatbot"
    };
    const data = leadData;

    const knowledgeBase = {
        businessWebsite: {
            service: "Business Website",
            keywords: ["business website", "company website", "website banwani", "website banwana", "website chahiye", "business ke liye website", "site banwani", "web site"],
            replies: {
                en: "Yes, a business website can include Home, About, Services, Portfolio, Contact, WhatsApp CTA, and basic SEO. Rough range is Rs 10k-Rs 25k.",
                hi: "Haan, business website mein Home, About, Services, Portfolio, Contact, WhatsApp CTA aur basic SEO add ho sakta hai. Rough range Rs 10k-Rs 25k hoti hai."
            }
        },
        landingPage: {
            service: "Landing Page",
            keywords: ["landing page", "single page", "campaign page", "ad page", "lead page"],
            replies: {
                en: "A landing page is good for ads, offers, launches, and lead generation. Rough range is Rs 5k-Rs 10k.",
                hi: "Landing page ads, offers, launches aur leads ke liye best hoti hai. Rough range Rs 5k-Rs 10k hoti hai."
            }
        },
        portfolioWebsite: {
            service: "Portfolio Website",
            keywords: ["portfolio", "personal website", "profile website", "resume website", "creator website"],
            replies: {
                en: "A portfolio website can show your work, skills, projects, testimonials, and contact options. Rough range is Rs 5k-Rs 15k.",
                hi: "Portfolio website mein aapka work, skills, projects, testimonials aur contact options show ho sakte hain. Rough range Rs 5k-Rs 15k hoti hai."
            }
        },
        ecommerceWebsite: {
            service: "E-commerce Website",
            keywords: ["ecommerce", "e-commerce", "online store", "shopping website", "products sell", "cart", "ecommerce ka cost", "store banana"],
            replies: {
                en: "E-commerce can include products, cart, checkout, payment gateway, order management, and admin panel. Rough range is Rs 20k-Rs 60k.",
                hi: "E-commerce mein products, cart, checkout, payment gateway, order management aur admin panel add ho sakta hai. Rough range Rs 20k-Rs 60k hoti hai."
            }
        },
        adminDashboard: {
            service: "Admin Dashboard",
            keywords: ["admin dashboard", "dashboard", "admin panel", "panel chahiye", "manage users", "reports dashboard"],
            replies: {
                en: "Yes, an admin dashboard can manage users, enquiries, products, orders, reports, and settings. Rough range is Rs 25k-Rs 80k.",
                hi: "Haan, admin dashboard se users, enquiries, products, orders, reports aur settings manage ho sakti hain. Rough range Rs 25k-Rs 80k hoti hai."
            }
        },
        crm: {
            service: "CRM",
            keywords: ["crm", "customer management", "lead management", "sales pipeline", "client followup", "follow-up"],
            replies: {
                en: "A CRM helps track leads, customers, follow-ups, status, notes, and sales activity. CRM/ERP projects usually start around Rs 40k.",
                hi: "CRM leads, customers, follow-ups, status, notes aur sales activity track karne ke kaam aata hai. CRM/ERP projects usually Rs 40k se start hote hain."
            }
        },
        erp: {
            service: "ERP",
            keywords: ["erp", "inventory", "billing software", "stock management", "business software", "operations software"],
            replies: {
                en: "ERP software connects operations like inventory, billing, teams, reports, and workflows. Rough range is Rs 40k-Rs 1.5L+ depending on modules.",
                hi: "ERP inventory, billing, team, reports aur workflows ko ek system mein connect karta hai. Rough range Rs 40k-Rs 1.5L+ hoti hai, modules par depend karta hai."
            }
        },
        aiChatbot: {
            service: "AI Chatbot / Enquiry Bot",
            keywords: ["ai chatbot", "chatbot", "enquiry bot", "inquiry bot", "bot ban sakta", "auto reply", "chat assistant"],
            replies: {
                en: "Yes, an enquiry chatbot can answer common questions, collect lead details, and submit enquiries. Cost depends on features and integrations.",
                hi: "Haan, enquiry chatbot common questions answer kar sakta hai, lead details collect kar sakta hai aur enquiry submit kar sakta hai. Cost features aur integrations par depend karega."
            }
        },
        automation: {
            service: "Automation",
            keywords: ["automation", "automate", "workflow", "auto message", "automatic", "zapier", "n8n"],
            replies: {
                en: "Automation can connect forms, Google Sheets, WhatsApp/Telegram alerts, email, and CRM workflows. Cost depends on the number of steps.",
                hi: "Automation forms, Google Sheets, WhatsApp/Telegram alerts, email aur CRM workflows ko connect kar sakti hai. Cost steps ke number par depend karega."
            }
        },
        googleSheets: {
            service: "Google Sheets Integration",
            keywords: ["google sheet", "google sheets", "sheet integration", "spreadsheet", "sheets automation", "lead sheet"],
            replies: {
                en: "Yes, Google Sheets integration is possible for saving leads, orders, form entries, and reports. Rough range is Rs 5k-Rs 20k.",
                hi: "Haan, Google Sheets integration se leads, orders, form entries aur reports save ho sakte hain. Rough range Rs 5k-Rs 20k hoti hai."
            }
        },
        whatsappTelegram: {
            service: "WhatsApp / Telegram Notification",
            keywords: ["whatsapp", "telegram", "notification", "alert", "message alert", "whatsapp alert", "telegram bot"],
            replies: {
                en: "WhatsApp or Telegram notifications can be added for new leads, orders, form submissions, and support alerts.",
                hi: "WhatsApp ya Telegram notifications new leads, orders, form submissions aur support alerts ke liye add ho sakte hain."
            }
        },
        paymentGateway: {
            service: "Payment Gateway",
            keywords: ["payment gateway", "payment", "razorpay", "payu", "stripe", "online payment", "checkout", "gateway add"],
            replies: {
                en: "Yes, payment gateway integration can be added. Final cost depends on the gateway, checkout flow, and project setup.",
                hi: "Haan, payment gateway integration add ho sakta hai. Final cost gateway, checkout flow aur project setup par depend karega."
            }
        },
        domainHosting: {
            service: "Domain and Hosting",
            keywords: ["domain", "hosting", "server", "website live", "ssl", "deploy", "deployment"],
            replies: {
                en: "Domain and hosting guidance can be provided. Setup depends on the website type, traffic, email needs, and server choice.",
                hi: "Domain aur hosting guidance mil jayegi. Setup website type, traffic, email needs aur server choice par depend karega."
            }
        },
        pricing: {
            service: "",
            keywords: ["price", "pricing", "cost", "charges", "rate", "budget", "kitna paisa", "kitna lagega", "kya price", "cost kya"],
            replies: {
                en: "Rough pricing: Landing Page Rs 5k-Rs 10k, Business Website Rs 10k-Rs 25k, Portfolio Rs 5k-Rs 15k, E-commerce Rs 20k-Rs 60k, Dashboard Rs 25k-Rs 80k, CRM/ERP Rs 40k-Rs 1.5L+.",
                hi: "Rough pricing: Landing Page Rs 5k-Rs 10k, Business Website Rs 10k-Rs 25k, Portfolio Rs 5k-Rs 15k, E-commerce Rs 20k-Rs 60k, Dashboard Rs 25k-Rs 80k, CRM/ERP Rs 40k-Rs 1.5L+."
            }
        },
        timeline: {
            service: "",
            keywords: ["timeline", "time", "kitna time", "days", "week", "kab tak", "delivery", "urgent", "jaldi"],
            replies: {
                en: "Timeline depends on scope. A landing page can take a few days, a business website around 1-2 weeks, and custom dashboards/CRM can take 2-6+ weeks.",
                hi: "Timeline scope par depend karta hai. Landing page kuch days, business website around 1-2 weeks, aur custom dashboard/CRM 2-6+ weeks le sakta hai."
            }
        },
        maintenance: {
            service: "Maintenance",
            keywords: ["maintenance", "support", "update", "bug fix", "changes", "monthly support"],
            replies: {
                en: "Maintenance can include updates, bug fixes, backups, small changes, and monitoring. Monthly support depends on workload.",
                hi: "Maintenance mein updates, bug fixes, backups, small changes aur monitoring aa sakti hai. Monthly support workload par depend karta hai."
            }
        },
        responsiveDesign: {
            service: "Mobile Responsive Design",
            keywords: ["responsive", "mobile responsive", "mobile friendly", "phone pe", "mobile design", "tablet"],
            replies: {
                en: "Yes, websites can be made mobile responsive so they work properly on phones, tablets, and desktops.",
                hi: "Haan, website mobile responsive ban sakti hai taaki phone, tablet aur desktop par properly chale."
            }
        },
        seoBasics: {
            service: "SEO Basics",
            keywords: ["seo", "google ranking", "search engine", "meta tags", "basic seo", "rank"],
            replies: {
                en: "Basic SEO can include page titles, meta descriptions, clean structure, fast loading, mobile responsiveness, and search-friendly content.",
                hi: "Basic SEO mein page titles, meta descriptions, clean structure, fast loading, mobile responsiveness aur search-friendly content aa sakta hai."
            }
        },
        leadGeneration: {
            service: "Lead Generation",
            keywords: ["lead", "leads", "customer chahiye", "enquiry", "inquiry", "business leads", "clients chahiye"],
            replies: {
                en: "For lead generation, we can use landing pages, WhatsApp CTAs, enquiry forms, tracking, Google Sheets, and follow-up automation.",
                hi: "Lead generation ke liye landing pages, WhatsApp CTA, enquiry forms, tracking, Google Sheets aur follow-up automation use ho sakti hai."
            }
        },
        backendAdmin: {
            service: "Backend / Admin Panel",
            keywords: ["backend", "back end", "admin", "backend bhi", "login system", "database", "server side", "api"],
            replies: {
                en: "Yes, backend and admin panel work can be done for logins, databases, dashboards, roles, APIs, and content management.",
                hi: "Haan, backend aur admin panel ban sakta hai for login, database, dashboard, roles, APIs aur content management."
            }
        }
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
        currentStep = 'language';
        addBotMessage("Choose your language / Apni language choose karein");
        setupQuickReplies([
            { label: "English", value: "English", primary: true },
            { label: "Hindi / Hinglish", value: "Hindi / Hinglish" }
        ]);
        return;

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

    function setupQuickReplies(options) {
        sendBtn.style.display = 'none';
        inputWrap.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'chatbot-btn-container';
        container.style.flexWrap = 'wrap';

        options.forEach(option => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = option.primary ? 'chatbot-opt-btn primary' : 'chatbot-opt-btn';
            btn.style.flex = '1 1 calc(50% - 10px)';
            btn.textContent = option.label;
            btn.addEventListener('click', () => processLeadInput(option.value || option.label));
            container.appendChild(btn);
        });

        inputWrap.appendChild(container);
    }

    function normalizeText(text) {
        return String(text || '')
            .toLowerCase()
            .replace(/[^\w\s/-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function detectIntent(message) {
        const text = normalizeText(message);
        let bestIntent = 'unknown';
        let bestLength = 0;

        for (const intent in knowledgeBase) {
            const item = knowledgeBase[intent];
            item.keywords.forEach(keyword => {
                const normalizedKeyword = normalizeText(keyword);
                if (text.includes(normalizedKeyword) && normalizedKeyword.length > bestLength) {
                    bestIntent = intent;
                    bestLength = normalizedKeyword.length;
                }
            });
        }

        return bestIntent;
    }

    function getKnowledgeReply(intent) {
        const isHindi = data.language === "Hindi / Hinglish";
        const fallback = isHindi
            ? "Main websites, e-commerce, admin panels, CRM/ERP, chatbot, automation, pricing aur timeline ke questions mein help kar sakta hoon. Aap kya banwana chahte ho?"
            : "I can help with websites, e-commerce, admin panels, CRM/ERP systems, chatbots, automation, pricing, and timelines. What are you trying to build?";

        if (!knowledgeBase[intent]) return fallback;

        return isHindi ? knowledgeBase[intent].replies.hi : knowledgeBase[intent].replies.en;
    }

    function isLikelyProjectQuestion(message) {
        const text = normalizeText(message);
        return /[?]/.test(message)
            || text.includes('kya')
            || text.includes('kaise')
            || text.includes('kitna')
            || text.includes('chahiye')
            || text.includes('banwana')
            || text.includes('banwani')
            || text.includes('milega')
            || text.includes('hoga')
            || text.includes('kar sakte')
            || text.includes('cost')
            || text.includes('price')
            || text.includes('time');
    }

    function isHinglish() {
        return leadData.language === "Hindi / Hinglish";
    }

    function askServiceQuestion() {
        currentStep = 'service';
        setupQuickReplies([
            { label: "Business Website", value: "Business Website", primary: true },
            { label: "E-commerce", value: "E-commerce" },
            { label: "Landing Page", value: "Landing Page" },
            { label: "Admin Dashboard", value: "Admin Dashboard" },
            { label: "CRM / ERP", value: "CRM / ERP" },
            { label: "AI Chatbot", value: "AI Chatbot" },
            { label: "Not Sure", value: "Not Sure" }
        ]);
    }

    function askProjectDetails() {
        currentStep = 'message';
        addBotMessage(isHinglish()
            ? "Samajh gaya. Is project mein exactly kya-kya chahiye?"
            : "Got it. Can you briefly explain what you want in this project?");
        setupTextInput(isHinglish() ? "Project details..." : "Project details...", leadData.message, true);
    }

    function askBudget() {
        currentStep = 'budget';
        addBotMessage(isHinglish()
            ? "Aapka approx budget range kya hai?"
            : "What budget range are you comfortable with?");
        setupQuickReplies([
            { label: "Below ₹10k", value: "Below ₹10k" },
            { label: "₹10k–₹25k", value: "₹10k–₹25k", primary: true },
            { label: "₹25k–₹50k", value: "₹25k–₹50k" },
            { label: "₹50k+", value: "₹50k+" },
            { label: "Not decided", value: "Not decided" }
        ]);
    }

    function askTimeline() {
        currentStep = 'timeline';
        addBotMessage(isHinglish()
            ? "Aapko ye kaam kab tak chahiye?"
            : "What timeline do you have in mind?");
        setupQuickReplies([
            { label: "Urgent", value: "Urgent" },
            { label: "1 week", value: "1 week" },
            { label: "2–4 weeks", value: "2–4 weeks", primary: true },
            { label: "Flexible", value: "Flexible" }
        ]);
    }

    function askName() {
        currentStep = 'name';
        addBotMessage(isHinglish()
            ? "Shresth aapse contact kar sake, iske liye apna naam bata dein."
            : "Please share your name so Shresth can contact you properly.");
        setupTextInput(isHinglish() ? "Aapka naam..." : "Your name...", leadData.name);
    }

    function askPhone(value = "") {
        currentStep = 'phone';
        addBotMessage(isHinglish()
            ? "Apna WhatsApp number share karein."
            : "Please share your WhatsApp number.");
        setupTextInput("Phone/WhatsApp Number...", value || leadData.phone);
    }

    function askEmail(value = "") {
        currentStep = 'email';
        addBotMessage(isHinglish()
            ? "Apni email ID share karein."
            : "Please share your email.");
        setupTextInput("Email ID...", value || leadData.email);
    }

    function validatePhone(value) {
        return value.replace(/\D/g, '').length >= 10;
    }

    function validateEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function buildFinalMessage() {
        return "Language: " + (leadData.language || "Not selected") + "\n" +
            "Timeline: " + (leadData.timeline || "Not shared") + "\n" +
            "Project Details: " + (leadData.message || "Not shared");
    }

    function getMissingRequiredField() {
        if (!leadData.service) return "service";
        if (!leadData.message) return "message";
        if (!leadData.budget) return "budget";
        if (!leadData.name) return "name";
        if (!leadData.phone) return "phone";
        if (!leadData.email) return "email";
        return "";
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

    function setupEditOptions() {
        sendBtn.style.display = 'none';
        inputWrap.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'chatbot-btn-container';
        container.style.flexWrap = 'wrap';

        [
            { label: "Edit Name", step: "editName" },
            { label: "Edit Phone", step: "editPhone" },
            { label: "Edit Email", step: "editEmail" },
            { label: "Edit Service", step: "editService" },
            { label: "Edit Budget", step: "editBudget" },
            { label: "Edit Timeline", step: "editTimeline" },
            { label: "Edit Project Details", step: "editMessage" },
            { label: "Submit As It Is", submit: true, primary: true }
        ].forEach(option => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = option.primary ? 'chatbot-opt-btn primary' : 'chatbot-opt-btn';
            btn.style.flex = '1 1 calc(50% - 10px)';
            btn.textContent = option.label;
            btn.addEventListener('click', () => {
                if (option.submit) {
                    submitEnquiry();
                    return;
                }

                addUserMessage(option.label);
                askEditField(option.step);
            });
            container.appendChild(btn);
        });

        inputWrap.appendChild(container);
    }

    function askEditField(step) {
        currentStep = step;

        if (step === "editName") {
            addBotMessage(isHinglish() ? "Apna updated naam bata dein." : "Please share the updated name.");
            setupTextInput(isHinglish() ? "Aapka naam..." : "Your name...", leadData.name);
        } else if (step === "editPhone") {
            addBotMessage(isHinglish() ? "Updated WhatsApp number share karein." : "Please share the updated WhatsApp number.");
            setupTextInput("Phone/WhatsApp Number...", leadData.phone);
        } else if (step === "editEmail") {
            addBotMessage(isHinglish() ? "Updated email ID share karein." : "Please share the updated email.");
            setupTextInput("Email ID...", leadData.email);
        } else if (step === "editService") {
            addBotMessage(isHinglish() ? "Updated service select karein." : "Please select the updated service.");
            setupQuickReplies([
                { label: "Business Website", value: "Business Website", primary: true },
                { label: "E-commerce", value: "E-commerce" },
                { label: "Landing Page", value: "Landing Page" },
                { label: "Admin Dashboard", value: "Admin Dashboard" },
                { label: "CRM / ERP", value: "CRM / ERP" },
                { label: "AI Chatbot", value: "AI Chatbot" },
                { label: "Not Sure", value: "Not Sure" }
            ]);
        } else if (step === "editBudget") {
            addBotMessage(isHinglish() ? "Updated budget range select karein." : "Please select the updated budget range.");
            setupQuickReplies([
                { label: "Below ₹10k", value: "Below ₹10k" },
                { label: "₹10k–₹25k", value: "₹10k–₹25k", primary: true },
                { label: "₹25k–₹50k", value: "₹25k–₹50k" },
                { label: "₹50k+", value: "₹50k+" },
                { label: "Not decided", value: "Not decided" }
            ]);
        } else if (step === "editTimeline") {
            addBotMessage(isHinglish() ? "Updated timeline select karein." : "Please select the updated timeline.");
            setupQuickReplies([
                { label: "Urgent", value: "Urgent" },
                { label: "1 week", value: "1 week" },
                { label: "2–4 weeks", value: "2–4 weeks", primary: true },
                { label: "Flexible", value: "Flexible" }
            ]);
        } else if (step === "editMessage") {
            addBotMessage(isHinglish() ? "Updated project details share karein." : "Please share the updated project details.");
            setupTextInput("Project Details...", leadData.message, true);
        }
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

        processLeadInput(value);
    }

    function processLeadInput(value) {
        if ([0, 1, 2, 3, 4, 5].includes(currentStep)) {
            processUserInput(value);
            return;
        }

        const intent = detectIntent(value);

        if (currentStep === 'phone' || currentStep === 'editPhone') {
            if (!validatePhone(value)) {
                addBotMessage(isHinglish()
                    ? "Phone number thoda incomplete lag raha hai. Please 10 digit WhatsApp/phone number bhejein."
                    : "That phone number looks incomplete. Please share a valid 10 digit WhatsApp/phone number.");
                setupTextInput("Phone/WhatsApp Number...", value);
                return;
            }
        } else if (currentStep === 'email' || currentStep === 'editEmail') {
            if (!validateEmail(value)) {
                addBotMessage(isHinglish()
                    ? "Email format sahi nahi lag raha. Please valid email ID bhejein, jaise name@example.com."
                    : "That email format does not look right. Please share a valid email, like name@example.com.");
                setupTextInput("Email ID...", value);
                return;
            }
        }

        addUserMessage(value);

        if (currentStep === 'editName') {
            leadData.name = value;
            showLeadSummary();
        } else if (currentStep === 'editPhone') {
            leadData.phone = value;
            showLeadSummary();
        } else if (currentStep === 'editEmail') {
            leadData.email = value;
            showLeadSummary();
        } else if (currentStep === 'editService') {
            leadData.service = value;
            showLeadSummary();
        } else if (currentStep === 'editBudget') {
            leadData.budget = value;
            showLeadSummary();
        } else if (currentStep === 'editTimeline') {
            leadData.timeline = value;
            showLeadSummary();
        } else if (currentStep === 'editMessage') {
            leadData.message = value;
            showLeadSummary();
        } else if (currentStep === 'language') {
            leadData.language = value;

            if (value === "English") {
                addBotMessage("Great. What are you trying to build or improve?");
            } else {
                addBotMessage("Badhiya. Aap kis type ki website ya software banwana chahte ho?");
            }

            askServiceQuestion();
        } else if (currentStep === 'service' || currentStep === 'serviceQuick') {
            let selectedService = value === "Not Sure" ? '' : value;

            if (intent !== 'unknown') {
                const service = knowledgeBase[intent].service;
                if (service) {
                    selectedService = service;
                } else {
                    addBotMessage(getKnowledgeReply(intent));
                    askServiceQuestion();
                    return;
                }
                addBotMessage(getKnowledgeReply(intent));
            } else if (value !== "Not Sure" && isLikelyProjectQuestion(value)) {
                addBotMessage(getKnowledgeReply('unknown'));
                askServiceQuestion();
                return;
            }

            leadData.service = selectedService || "Not Sure";
            askProjectDetails();
        } else if (currentStep === 'message') {
            leadData.message = value;

            if (intent !== 'unknown' && isLikelyProjectQuestion(value)) {
                const service = knowledgeBase[intent].service;
                if (service && (!leadData.service || leadData.service === "Not Sure")) leadData.service = service;
                addBotMessage(getKnowledgeReply(intent));
            }

            askBudget();
        } else if (currentStep === 'budget') {
            if (intent !== 'unknown' && isLikelyProjectQuestion(value)) {
                addBotMessage(getKnowledgeReply(intent));
                askBudget();
                return;
            }

            leadData.budget = value;
            askTimeline();
        } else if (currentStep === 'timeline') {
            if (intent !== 'unknown' && intent !== 'timeline' && isLikelyProjectQuestion(value)) {
                addBotMessage(getKnowledgeReply(intent));
                askTimeline();
                return;
            }

            leadData.timeline = value;
            askName();
        } else if (currentStep === 'name') {
            if (intent !== 'unknown') {
                const service = knowledgeBase[intent].service;
                if (service && (!leadData.service || leadData.service === "Not Sure")) leadData.service = service;
                addBotMessage(getKnowledgeReply(intent));
                askName();
                return;
            }

            if (isLikelyProjectQuestion(value)) {
                addBotMessage(getKnowledgeReply('unknown'));
                askName();
                return;
            }

            leadData.name = value;
            askPhone();
        } else if (currentStep === 'phone') {
            leadData.phone = value;
            askEmail();
        } else if (currentStep === 'email') {
            leadData.email = value;
            currentStep = 'summary';
            showLeadSummary();
        } else {
            processUserInput(value);
        }
    }

    function showLeadSummary() {
        const missingField = getMissingRequiredField();
        if (missingField === "service") {
            askServiceQuestion();
            return;
        } else if (missingField === "message") {
            askProjectDetails();
            return;
        } else if (missingField === "budget") {
            askBudget();
            return;
        } else if (missingField === "name") {
            askName();
            return;
        } else if (missingField === "phone") {
            askPhone();
            return;
        } else if (missingField === "email") {
            askEmail();
            return;
        }

        currentStep = 'summary';
        const summaryHtml = `
            <b>${isHinglish() ? "Apni enquiry details ek baar check kar lo:" : "Please review your enquiry details:"}</b><br><br>
            <b>Name:</b> ${leadData.name}<br>
            <b>Phone:</b> ${leadData.phone}<br>
            <b>Email:</b> ${leadData.email}<br>
            <b>Service:</b> ${leadData.service}<br>
            <b>Budget:</b> ${leadData.budget}<br>
            <b>Timeline:</b> ${leadData.timeline || "Not shared"}<br>
            <b>Project Details:</b> ${leadData.message}<br><br>
            ${isHinglish() ? "Kya main ye enquiry Shresth ko submit kar doon?" : "Should I submit this enquiry to Shresth?"}
        `;
        addBotMessage(summaryHtml);
        setupButtonInput();
    }

    function processUserInput(value) {

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
        const intent = detectIntent(value);

        if (currentStep === 'language') {
            data.language = value;
            currentStep = 'serviceQuick';

            if (value === "English") {
                addBotMessage("Great. What are you trying to build or improve?");
            } else {
                addBotMessage("Badhiya. Aap kis type ki website ya software banwana chahte ho?");
            }

            setupQuickReplies([
                { label: "Business Website", value: "Business Website", primary: true },
                { label: "E-commerce", value: "E-commerce" },
                { label: "Landing Page", value: "Landing Page" },
                { label: "Admin Dashboard", value: "Admin Dashboard" },
                { label: "CRM / ERP", value: "CRM / ERP" },
                { label: "AI Chatbot", value: "AI Chatbot" },
                { label: "Not Sure", value: "Not Sure" }
            ]);
        } else if (currentStep === 'serviceQuick') {
            let selectedService = value === "Not Sure" ? '' : value;

            if (intent !== 'unknown') {
                const service = knowledgeBase[intent].service;
                if (service) selectedService = service;
                addBotMessage(getKnowledgeReply(intent));
            } else if (value !== "Not Sure") {
                addBotMessage(getKnowledgeReply('unknown'));
            }

            data.service = selectedService;
            currentStep = 0;
            addBotMessage("Got it. To register your enquiry, sabse pehle aapka name kya hai?");
            setupTextInput("Aapka Naam...", data.name);
        } else if (currentStep === 0) {
            if (intent !== 'unknown') {
                const service = knowledgeBase[intent].service;
                if (service && !data.service) data.service = service;
                addBotMessage(getKnowledgeReply(intent));
                addBotMessage("To register your enquiry, sabse pehle aapka name kya hai?");
                setupTextInput("Aapka Naam...", data.name);
                return;
            }

            if (isLikelyProjectQuestion(value)) {
                addBotMessage(getKnowledgeReply('unknown'));
                setupTextInput("Aapka Naam...", data.name);
                return;
            }

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
            if (data.service) {
                currentStep = 4;
                addBotMessage("Got it! Project ka estimated budget range kya hai? (INR)");
                setupSelectInput([
                    "< â‚¹10k (Small Task)",
                    "â‚¹10k - â‚¹30k (Basic App)",
                    "â‚¹30k - â‚¹50k (Custom Build)",
                    "â‚¹50k - â‚¹1 Lakh (Advanced Platform)",
                    "â‚¹1 Lakh+ (Enterprise / SaaS)"
                ], data.budget);
            } else {
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
            }
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
        showLeadSummary();
        return;

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
        addBotMessage(isHinglish()
            ? "Kaunsi detail edit karni hai?"
            : "Which detail would you like to edit?");
        setupEditOptions();
    }

    function submitEnquiry() {
        if (isSubmitting) return;

        isSubmitting = true;
        addUserMessage("Submit Enquiry");

        const submitBtnElement = document.getElementById('btnSubmitEnquiry');
        const editBtnElement = document.getElementById('btnEditEnquiry');
        if (submitBtnElement) submitBtnElement.disabled = true;
        if (editBtnElement) editBtnElement.disabled = true;

        if (!GOOGLE_SHEET_WEB_APP_URL || GOOGLE_SHEET_WEB_APP_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE" || GOOGLE_SHEET_WEB_APP_URL.trim() === "") {
            console.error("Google Sheet URL is not configured.");
            addBotMessage("Google Sheet URL is not configured.");
            isSubmitting = false;
            if (submitBtnElement) submitBtnElement.disabled = false;
            if (editBtnElement) editBtnElement.disabled = false;
            return;
        }

        addBotMessage(isHinglish() ? "Aapki enquiry submit ho rahi hai..." : "Submitting your enquiry...");

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('phone', data.phone);
        formData.append('email', data.email);
        formData.append('service', data.service);
        formData.append('budget', data.budget);
        formData.append('message', buildFinalMessage());
        formData.append('timestamp', new Date().toISOString());
        formData.append('source', leadData.source);

        fetch(GOOGLE_SHEET_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        })
        .then(() => {
            addBotMessage(isHinglish()
                ? "Aapki enquiry submit ho gayi hai. Shresth jaldi contact karega."
                : "Your enquiry has been submitted successfully. Shresth will contact you soon.");
            sendBtn.style.display = 'none';
            inputWrap.innerHTML = `<span style="font-size:0.85rem;color:var(--green);font-weight:600;">Saved Successfully! ✅</span>`;
        })
        .catch(err => {
            console.error("Fetch failed", err);
            isSubmitting = false;
            addBotMessage(isHinglish()
                ? "Kuch issue aa gaya. Please dobara try karein ya direct WhatsApp par contact karein."
                : "Something went wrong. Please try again or contact directly on WhatsApp.");
            if (submitBtnElement) submitBtnElement.disabled = false;
            if (editBtnElement) editBtnElement.disabled = false;
        });
    }
});
