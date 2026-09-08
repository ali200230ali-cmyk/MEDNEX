heredocument.addEventListener("DOMContentLoaded", function () {

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


  async function searchMedicine() {

    const query = searchInput.value.trim();

    if (!query) {
      results.innerHTML =
        "<p>اكتب اسم الدواء أولًا.</p>";
      return;
    }

    results.innerHTML =
      "<p>🔎 جاري البحث الذكي عن الدواء...</p>";

    try {

      // ==========================================
      // البحث الموسع في FDA
      // ==========================================

      const searchExpression =
        'openfda.brand_name:"' + query + '"' +
        ' OR openfda.generic_name:"' + query + '"' +
        ' OR openfda.substance_name:"' + query + '"' +
        ' OR active_ingredient:"' + query + '"';

      const fdaUrl =
        "https://api.fda.gov/drug/label.json" +
        "?search=" +
        encodeURIComponent(searchExpression) +
        "&limit=10";

      const response = await fetch(fdaUrl);

      if (!response.ok) {
        throw new Error("FDA search failed");
      }

      const data = await response.json();

      medicines = data.results || [];

      // ==========================================
      // عرض النتائج
      // ==========================================

      if (medicines.length === 0) {

        results.innerHTML = `
          <div class="medicine-card">

            <h3>🔍 لم نجد نتيجة مباشرة</h3>

            <p>
              لم نجد دواء مطابقًا تمامًا للكلمة التي أدخلتها.
            </p>

            <p>
              جرّب الاسم التجاري أو المادة الفعالة
              باللغة الإنجليزية.
            </p>

          </div>
        `;

        return;
      }


      let html = "";

      medicines.forEach(function (drug, index) {

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


        html += `

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

      });


      results.innerHTML = html;


    } catch (error) {

      console.error(error);

      results.innerHTML = `

        <div class="medicine-card">

          <h3>
            ⚠️ تعذر البحث
          </h3>

          <p>
            حدثت مشكلة أثناء الاتصال بقاعدة بيانات
            المعلومات الدوائية.
          </p>

          <p>
            حاول مرة أخرى.
          </p>

        </div>

      `;

    }

  }


  // ==========================================
  // تفاصيل الدواء
  // ==========================================

  window.showMedicineDetails = function (index) {

    const drug = medicines[index];

    if (!drug) {
      return;
    }


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


    const purpose =
      drug.purpose?.[0] ||
      drug.indications_and_usage?.[0] ||
      "غير مذكور في السجل المتاح";


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


        <hr>


        <h4>
          🩺 الاستخدامات
        </h4>

        <p>
          ${purpose}
        </p>


        <h4>
          ⚕️ الآثار الجانبية
        </h4>

        <p>
          ${adverse}
        </p>


        <h4>
          ⚠️ التحذيرات
        </h4>

        <p>
          ${warnings}
        </p>


        <h4>
          🚫 موانع الاستعمال
        </h4>

        <p>
          ${contraindications}
        </p>


        <h4>
          💉 الجرعات وطريقة الاستخدام
        </h4>

        <p>
          ${dosage}
        </p>


        <h4>
          🔄 التداخلات الدوائية
        </h4>

        <p>
          ${interactions}
        </p>


        <div class="source-box">

          <strong>
            📚 المصدر
          </strong>

          <p>
            U.S. Food and Drug Administration —
            openFDA Drug Labeling
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

          🔙 العودة إلى نتائج البحث

        </button>

      </div>

    `;

  };


  // ==========================================
  // العودة للبحث
  // ==========================================

  window.searchMedicineAgain = function () {

    searchMedicine();

  };


});
