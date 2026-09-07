// MEDNEX - Main Application

document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll(".service button");

    buttons.forEach((button) => {

        button.addEventListener("click", () => {

            const service = button.parentElement.querySelector("h3").textContent;

            if (service.includes("البحث عن دواء")) {
                alert("💊 قريبًا: محرك البحث عن الأدوية");
            }

            else if (service.includes("الصيدليات")) {
                alert("🏥 قريبًا: دليل الصيدليات");
            }

            else if (service.includes("الوصفة")) {
                alert("📋 قريبًا: نظام الوصفات الطبية");
            }

            else if (service.includes("المساعد")) {
                alert("🤖 قريبًا: المساعد الصحي الذكي");
            }

        });

    });

});
