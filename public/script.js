async function loadSection(section, containerId) {
    try {
        const res = await fetch(`/api/content/${section}`);
        const data = await res.json();
        const container = document.getElementById(containerId);

        if(section === "skills") {
            JSON.parse(data).forEach(skill => {
                const span = document.createElement("span");
                span.className = "skill";
                span.textContent = skill;
                container.appendChild(span);
            });
        } else if(section === "projects") {
            JSON.parse(data).forEach(proj => {
                const div = document.createElement("div");
                div.className = "project-item";
                div.innerHTML = `<h3>${proj.title}</h3><p><span class="date">${proj.year}</span></p><p>${proj.description}</p>`;
                container.appendChild(div);
            });
        } else if(section === "about") {
            container.innerHTML = JSON.parse(data).text;
        } else if(section === "languages") {
            JSON.parse(data).forEach(lang => {
                const li = document.createElement("li");
                li.textContent = lang;
                container.appendChild(li);
            });
        }
    } catch(err) { console.error(err); }
}

// Load profile header
async function loadProfile() {
    try {
        const res = await fetch('/api/profile');
        if (!res.ok) return; 
        const profile = await res.json();
        const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        const title = profile.title || '';
        const avatarUrl = profile.avatar_url;

        const nameEl = document.getElementById('fullName');
        const titleEl = document.getElementById('titleText');
        const avatarEl = document.getElementById('avatar');

        if (nameEl) nameEl.textContent = fullName;
        if (titleEl) titleEl.textContent = title;
        if (avatarEl && avatarUrl) { 
            avatarEl.src = avatarUrl; 
            avatarEl.style.display = 'inline-block';
        }
    } catch (e) { console.error(e); }
}

// Load all sections
loadProfile();
loadSection("about","aboutContent");
loadSection("skills","skillsContent");
loadSection("projects","projectsContent");
loadSection("languages","languagesContent");

// Contact form submission
const contactForm = document.getElementById("contactForm");
const responseMessage = document.getElementById("responseMessage");

contactForm.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value
    };
    try {
        const res = await fetch("/submit", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(formData)
        });
        const data = await res.json();
        responseMessage.textContent = data.message;
        responseMessage.style.color = "green";
        contactForm.reset();
    } catch(err) {
        responseMessage.textContent = "Error sending message!";
        responseMessage.style.color = "red";
    }
});
