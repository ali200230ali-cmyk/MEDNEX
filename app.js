document.addEventListener("DOMContentLoaded", function () {

  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("medicineSearch");
  const results = document.getElementById("results");

  searchButton.addEventListener("click", searchMedicine);

  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      searchMedicine();
    }
  });

  async function searchMedicine() {

    const query = searchInput.value.trim();

    if (!query) {
      results.innerHTML = "<p>اكتب اسم الدواء أولًا.</p>";
      return;
    }

    results.innerHTML = "<p>🔎 جاري البحث في قاعدة البيانات الدوائية...</p>";

    try {

      const url =
        "https://api.fda.gov/drug/label.json" +
        "?search=openfda.generic_name:" +
        encodeURIComponent(query) +
        "&limit=5";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Drug not found");
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        results.innerHTML =
          "<p>❌ لم نجد معلومات لهذا الدواء في المصدر.</p>";
        return;
      }

      results.innerHTML = data.results.map(function (drug) {

        const name =
          drug.openfda?.brand_name?.[0] ||
          drug.openfda?.generic_name?.[0] ||
          "غير متوفر";

        const generic =
          drug.openfda?.generic_name?.[0] ||
          "غير متوفر";

        const manufacturer =
          drug.openfda?.manufacturer_name?.[0] ||
          "غير متوفر";

        const purpose =
          drug.purpose?.[0] ||
          drug.indications_and_usage?.[0] ||
          "غير متوفر";

        const warnings =
          drug.warnings?.[0] ||
          "غير متوفر";

        const adverse =
          drug.adverse_reactions?.[0] ||
          "غير متوفر";

        return `
          <div class="medicine-card">

            <h3>💊 ${name}</h3>

            <p>
              <strong>المادة الفعالة:</strong>
              ${generic}
            </p>

            <p>
              <strong>الشركة:</strong>
              ${manufacturer}
            </p>

            <hr>

            <h4>🩺 الاستخدامات</h4>
            <p>${purpose}</p>

            <h4>⚠️ التحذيرات</h4>
            <p>${warnings}</p>

            <h4>⚕️ الآثار الجانبية</h4>
            <p>${adverse}</p>

            <div style="
              margin-top:20px;
              padding:12px;
              background:#eef7f9;
              border-radius:8px;
            ">
              <strong>📚 المصدر</strong>
              <p>
                U.S. FDA — openFDA Drug Labeling
              </p>

              <a
                href="https://open.fda.gov/apis/drug/label/"
                target="_blank"
                rel="noopener noreferrer"
              >
                عرض المصدر الرسمي
              </a>
            </div>

          </div>
        `;

      }).join("");

    } catch (error) {

      console.error(error);

      results.innerHTML = `
        <div class="medicine-card">
          <h3>⚠️ تعذر الحصول على البيانات</h3>
          <p>
            لم نتمكن حاليًا من الوصول إلى قاعدة بيانات FDA.
          </p>
          <p>
            حاول البحث باسم المادة الفعالة بالإنجليزية.
          </p>
        </div>
      `;
    }

  }

});
