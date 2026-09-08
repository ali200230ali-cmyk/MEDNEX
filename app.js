// MEDNEX - Smart Medicine Search

const medicines = [
    {
        name: "Panadol",
        generic: "Paracetamol",
        form: "Tablets",
        strength: "500 mg",
        use: "لتخفيف الألم وخفض الحرارة"
    },
    {
        name: "Paracetamol",
        generic: "Paracetamol",
        form: "Tablets",
        strength: "500 mg",
        use: "مسكن للألم وخافض للحرارة"
    },
    {
        name: "Amoxicillin",
        generic: "Amoxicillin",
        form: "Capsules",
        strength: "500 mg",
        use: "مضاد حيوي لبعض الالتهابات البكتيرية"
    },
    {
        name: "Omeprazole",
        generic: "Omeprazole",
        form: "Capsules",
        strength: "20 mg",
        use: "يستخدم لتقليل إفراز حمض المعدة"
    },
    {
        name: "Pantoprazole",
        generic: "Pantoprazole",
        form: "Tablets",
        strength: "40 mg",
        use: "يستخدم لعلاج حالات مرتبطة بزيادة حمض المعدة"
    }
];

document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll(".service button");

    buttons.forEach((button) => {

        button.addEventListener("click", () => {

            const service =
                button.parentElement.querySelector("h3").textContent;

            if (service.includes("البحث عن دواء")) {

                const name = prompt(
                    "💊 اكتب اسم الدواء الذي تريد البحث عنه:"
                );

                if (!name) return;

                const results = medicines.filter((medicine) =>
                    medicine.name.toLowerCase().includes(name.toLowerCase()) ||
                    medicine.generic.toLowerCase().includes(name.toLowerCase())
                );

                if (results.length === 0) {

                    alert(
                        "❌ لم نجد الدواء في قاعدة البيانات التجريبية."
                    );

                    return;
                }

                let message = "💊 نتائج البحث:\n\n";

                results.forEach((medicine, index) => {

                    message +=
                        `${index + 1}. ${medicine.name}\n` +
                        `المادة الفعالة: ${medicine.generic}\n` +
                        `الشكل: ${medicine.form}\n` +
                        `التركيز: ${medicine.strength}\n` +
                        `الاستخدام: ${medicine.use}\n\n`;

                });

                message +=
                    "⚠️ هذه معلومات أولية وليست وصفة طبية.";

                alert(message);
            }

            else if (service.includes("الصيدليات")) {

                alert(
                    "🏥 نظام الصيدليات قيد التطوير.\n\n" +
                    "قريبًا ستظهر الصيدليات المتوفرة ومواقعها."
                );

            }

            else if (service.includes("الوصفة")) {

                alert(
                    "📋 نظام الوصفات الطبية قيد التطوير."
                );

            }

            else if (service.includes("المساعد")) {

                alert(
                    "🤖 المساعد الصحي الذكي قيد التطوير."
                );

            }

        });

    });

});
