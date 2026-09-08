const medicines = [
  {
    name: "Panadol",
    generic: "Paracetamol",
    strength: "500 mg",
    form: "Tablets",
    use: "مسكن للألم وخافض للحرارة"
  },
  {
    name: "Paracetamol",
    generic: "Paracetamol",
    strength: "500 mg",
    form: "Tablets",
    use: "مسكن للألم وخافض للحرارة"
  },
  {
    name: "Amoxicillin",
    generic: "Amoxicillin",
    strength: "500 mg",
    form: "Capsules",
    use: "مضاد حيوي لبعض الالتهابات البكتيرية"
  },
  {
    name: "Omeprazole",
    generic: "Omeprazole",
    strength: "20 mg",
    form: "Capsules",
    use: "لتقليل إفراز حمض المعدة"
  },
  {
    name: "Pantoprazole",
    generic: "Pantoprazole",
    strength: "40 mg",
    form: "Tablets",
    use: "لتقليل إفراز حمض المعدة"
  }
];

document.addEventListener("DOMContentLoaded", function () {

  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("medicineSearch");
  const results = document.getElementById("results");

  if (!searchButton || !searchInput || !results) {
    console.error("MEDNEX: Search elements not found.");
    return;
  }

  searchButton.addEventListener("click", searchMedicine);

  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      searchMedicine();
    }
  });

  function searchMedicine() {

    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      results.innerHTML =
        "<p>اكتب اسم الدواء أولًا.</p>";
      return;
    }

    const matches = medicines.filter(function (medicine) {
      return (
        medicine.name.toLowerCase().includes(query) ||
        medicine.generic.toLowerCase().includes(query)
      );
    });

    if (matches.length === 0) {
      results.innerHTML =
        "<p>❌ لم نجد الدواء في قاعدة البيانات التجريبية.</p>";
      return;
    }

    results.innerHTML = matches.map(function (medicine) {

      return `
        <div class="medicine-card">
          <h3>💊 ${medicine.name}</h3>
          <p><strong>المادة الفعالة:</strong> ${medicine.generic}</p>
          <p><strong>التركيز:</strong> ${medicine.strength}</p>
          <p><strong>الشكل الدوائي:</strong> ${medicine.form}</p>
          <p><strong>الاستخدام:</strong> ${medicine.use}</p>
        </div>
      `;

    }).join("");

  }

});
