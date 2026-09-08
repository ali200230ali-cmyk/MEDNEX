document.addEventListener("DOMContentLoaded", function () {

  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("medicineSearch");
  const results = document.getElementById("results");

  let medicines = [];

  searchButton.addEventListener("click", searchMedicine);

  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      searchMedicine();
    }
  });

  async function searchFDA(term) {

    const fields = [
      "openfda.brand_name",
      "openfda.generic_name",
      "openfda.substance_name"
    ];

    const allResults = [];

    for (const field of fields) {

      const url =
        "https://api.fda.gov/drug/label.json" +
        "?search=" +
        encodeURIComponent(field + ":" + term) +
        "&limit=10";

      try {

        const response = await fetch(url);

        if (response.ok) {

          const data = await response.json();

          if (data.results) {
            allResults.push(...data.results);
          }

        }

      } catch (error) {
        console.log("FDA search error:", error);
      }
    }

    // إزالة النتائج المكررة
    const unique = [];

    const seen = new Set();

    for (const drug of allResults) {

      const id =
        drug.id ||
        drug.set_id ||
        JSON.stringify(drug.openfda);

      if (!seen.has(id)) {

        seen.add(id);
        unique.push(drug);

      }
    }

    return unique;
  }


  async function searchMedicine() {

    const originalQuery =
      searchInput.value.trim();

    if (!originalQuery) {

      results.innerHTML =
        "<p>اكتب اسم الدواء أولًا.</p>";

      return;
    }

    results.innerHTML =
      "<p>🔎 جاري البحث في قاعدة FDA...</p>";

    /*
      أسماء شائعة لها أسماء دولية مختلفة
    */

    const synonyms = {

      paracetamol: "acetaminophen",
      panadol: "acetaminophen",
      salbutamol: "albuterol",
      adrenaline: "epinephrine",
      acetaminophen: "acetaminophen"

    };

    const query =
      synonyms[originalQuery.toLowerCase()] ||
      originalQuery;


    medicines = await searchFDA(query);


    if (medicines.length === 0) {

      results.innerHTML = `

        <div class="medicine-card">

          <h3>🔍 لم نجد الدواء</h3>

          <p>
            لم نجد نتيجة مطابقة لـ
            <strong>${originalQuery}</strong>
            في قاعدة البيانات الحالية.
          </p>

          <p>
            جرّب الاسم التجاري أو المادة الفعالة
            باللغة الإنجليزية.
          </p>

        </div>

      `;

      return;
    }


    results.innerHTML = medicines.map(
      function (drug, index) {

        const brand =
          drug.openfda?.brand_name?.[0] ||
          "اسم غير متوفر";

        const generic =
          drug.openfda?.generic_name?.[0] ||
          drug.openfda?.substance_name?.[0] ||
          "غير متوفر";

        const manufacturer =
          drug.openfda?.manufacturer_name?.[0] ||
          "غير متوفر";


        return `

          <div class="medicine-card">

            <h3>
              💊 ${brand}
            </h3>

            <div class="info-grid">

              <div class="info-item">

                <strong>
                  🧪 المادة الفعالة
                </strong>

                ${generic}

              </div>

              <div class="info-item">

                <strong>
                  🏭 الشركة
                </strong>

                ${manufacturer}

              </div>

            </div>

            <button
              onclick="showMedicineDetails(${index})"
              style="
                margin-top:15px;
                padding:13px 22px;
                border:none;
                border-radius:10px;
                background:#087f8c;
                color:white;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
              "
            >
              📋 عرض تفاصيل الدواء
            </button>

          </div>

        `;

      }
    ).join("");

  }


  window.showMedicineDetails = asyncfunction (index) {

    const drug = medicines[index];

    if (!drug) return;


    const brand =
      drug.openfda?.brand_name?.[0] ||
      "غير متوفر";

    const generic =
      drug.openfda?.generic_name?.[0] ||
      drug.openfda?.substance_name?.[0] ||
      "غير متوفر";

    const manufacturer =
      drug.openfda?.manufacturer_name?.[0] ||
      "غير متوفر";

    const indications =
      drug.indications_and_usage?.[0] ||
      "غير مذكورة في السجل المتاح";

    const adverse =
      drug.adverse_reactions?.[0] ||
      "غير مذكورة في السجل الدوائي المتاح";

    const warnings =
      drug.warnings?.[0] ||
      drug.boxed_warning?.[0] ||
      "غير مذكورة في السجل المتاح";

    const contraindications =
      drug.contraindications?.[0] ||
      "غير مذكورة في السجل المتاح";

    const dosage =
      drug.dosage_and_administration?.[0] ||
      "غير مذكور في السجل المتاح";

    const interactions =
      drug.drug_interactions?.[0] ||
      "غير مذكورة في السجل المتاح";


    results.innerHTML = `

      <div class="medicine-card">

        <h3>
          💊 ${brand}
        </h3>

        <div class="info-grid">

          <div class="info-item">
            <strong>🧪 المادة الفعالة</strong>
            ${generic}
          </div>

          <div class="info-item">
            <strong>🏭 الشركة</strong>
            ${manufacturer}
          </div>
        </div>

        <hr>

        <h4>🩺 الاستخدامات</h4>
        <p>${indications}</p>

        <h4>⚕️ الآثار الجانبية</h4>
        <p>${adverse}</p>

        <h4>⚠️ التحذيرات</h4>
        <p>${warnings}</p>

        <h4>🚫 موانع الاستعمال</h4>
        <p>${contraindications}</p>

        <h4>💉 الجرعات وطريقة الاستخدام</h4>
        <p>${dosage}</p>

        <h4>🔄 التداخلات الدوائية</h4>
        <p>${interactions}</p>

        <div class="source-box">

          <strong>📚 المصدر</strong>

          <p>
            U.S. Food and Drug Administration
            — openFDA Drug Labeling
          </p>

          <a
            href="https://open.fda.gov/apis/drug/label/"
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 فتح المصدر الرسمي
          </a>

        </div>

        <button
          onclick="searchMedicineAgain()"
          style="
            margin-top:20px;
            padding:12px 20px;
            border:none;
            border-radius:10px;
            background:#063b4c;
            color:white;
            font-size:15px;
            cursor:pointer;
          "
        >
          🔙 العودة للبحث
        </button>

      </div>

    `;

  };


  window.searchMedicineAgain = function () {

    results.innerHTML =
      "<p>اكتب اسم الدواء للبحث.</p>";

  };

});
