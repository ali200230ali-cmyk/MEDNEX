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

    results.innerHTML =
      "<p>🔎 جاري البحث في قاعدة البيانات الدوائية الرسمية...</p>";

    try {

      const encodedQuery = encodeURIComponent(query);

      // البحث في الاسم التجاري والمادة الفعالة
      const url =
        "https://api.fda.gov/drug/label.json" +
        "?search=" +
        "openfda.brand_name:" + encodedQuery +
        "+openfda.generic_name:" + encodedQuery +
        "&limit=10";

      let response = await fetch(url);

      // إذا لم نجد نتيجة، نجرب البحث العام
      if (!response.ok) {

        const fallbackUrl =
          "https://api.fda.gov/drug/label.json" +
          "?search=" + encodedQuery +
          "&limit=10";

        response = await fetch(fallbackUrl);
      }

      if (!response.ok) {
        throw new Error("Drug not found");
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {

        results.innerHTML = `
          <div class="medicine-card">
            <h3>❌ لم نجد الدواء</h3>
            <p>
              لم نجد معلومات مطابقة في قاعدة بيانات FDA.
            </p>
            <p>
              جرّب الاسم العلمي بالإنجليزية مثل:
              <strong>paracetamol</strong>
            </p>
          </div>
        `;

        return;
      }

      results.innerHTML = data.results.map(function (drug) {

        const brand =
          drug.openfda?.brand_name?.[0] ||
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

            <h3>💊 ${brand}</h3>

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

              <strong>📚 مصدر المعلومات</strong>

              <p>
                U.S. Food and Drug Administration (FDA)
                — openFDA Drug Labeling
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

          <h3>⚠️ حدث خطأ</h3>

          <p>
            تعذر الاتصال بقاعدة البيانات الدوائية حاليًا.
          </p>

          <p>
            حاول مرة أخرى أو استخدم الاسم العلمي للدواء
            باللغة الإنجليزية.
          </p>

        </div>
      `;
    }

  }

});
