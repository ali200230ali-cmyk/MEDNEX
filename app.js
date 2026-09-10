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

  async function searchMedicine() {

    const query = searchInput.value.trim();

    if (!query) {
      results.innerHTML = "<p>اكتب اسم الدواء أولًا.</p>";
      return;
    }

    results.innerHTML = "<p>🔎 جاري البحث في FDA...</p>";

    try {

      const synonyms = {
        "paracetamol": "acetaminophen",
        "بانادول": "panadol",
        "باراسيتامول": "acetaminophen",
        "acetaminophen": "acetaminophen",
        "panadol": "panadol"
      };

      const searchTerm =
        synonyms[query.toLowerCase()] || query;

      const fdaUrl =
        "https://api.fda.gov/drug/label.json" +
        "?search=" +
        encodeURIComponent(
          'openfda.brand_name:"' +
          searchTerm +
          '" OR openfda.generic_name:"' +
          searchTerm +
          '"'
        ) +
        "&limit=5";

      const response = await fetch(fdaUrl);

      if (!response.ok) {
        throw new Error("FDA request failed");
      }

      const data = await response.json();

      medicines = data.results || [];

      if (medicines.length === 0) {

        results.innerHTML = `
          <div class="medicine-card">
            <h3>💊 لم نجد الدواء</h3>
            <p>لم نجد نتيجة مطابقة في قاعدة بيانات FDA.</p>
          </div>
        `;

        return;
      }

      results.innerHTML = medicines.map(function (drug, index) {

        const brand =
          drug.openfda?.brand_name?.[0] ||
          "غير متوفر";

        const generic =
          drug.openfda?.generic_name?.[0] ||
          "غير متوفر";

        const manufacturer =
          drug.openfda?.manufacturer_name?.[0] ||
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

            <button
              onclick="showMedicineDetails(${index})"
              style="
                margin-top:15px;
                padding:12px 20px;
                border:none;
                border-radius:10px;
                background:#087f8c;
                color:white;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
              "
            >
              📋 عرض التفاصيل
            </button>

          </div>
        `;

      }).join("");

    } catch (error) {

      console.error(error);

      results.innerHTML = `
        <div class="medicine-card">

          <h3>⚠️ حدث خطأ</h3>

          <p>
            تعذر الاتصال بمصدر المعلومات حاليًا.
          </p>

        </div>
      `;
    }
  }

async function loadPubMedResearch(term) {

  const box = document.getElementById("pubmedResearch");

  if (!box) return;

  box.innerHTML = "<p>🔬 جاري البحث عن أحدث الدراسات...</p>";

  try {

    const searchUrl =
      "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi" +
      "?db=pubmed" +
      "&term=" +
encodeURIComponent(
  "(" + term + ") AND (" +
  "clinical trial[pt] OR " +
  "randomized controlled trial[pt] OR " +
  "systematic review[pt] OR " +
  "meta-analysis[pt] OR " +
  "review[pt] OR " +
  "observational study[pt]" +
  ")"
) + +
      "&retmode=json" +
      "&retmax=5" +
      "&sort=date";

    const response = await fetch(searchUrl);

    if (!response.ok) {
      throw new Error("PubMed search failed");
    }

    const data = await response.json();

    const ids =
      data?.esearchresult?.idlist || [];

    if (ids.length === 0) {

      box.innerHTML = `
        <h4>🔬 الأبحاث العلمية</h4>
        <p>لم نجد أبحاثًا مطابقة في PubMed.</p>
      `;

      return;
    }

    const fetchUrl =
      "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi" +
      "?db=pubmed" +
      "&id=" +
      ids.join(",") +
      "&retmode=xml";

    const fetchResponse = await fetch(fetchUrl);

    if (!fetchResponse.ok) {
      throw new Error("PubMed fetch failed");
    }

    const xmlText = await fetchResponse.text();

    const parser = new DOMParser();
    const xml = parser.parseFromString(
      xmlText,
      "text/xml"
    );

    const articles =
      Array.from(
        xml.querySelectorAll("PubmedArticle")
      );

    let html = `
      <h4>🔬 الأبحاث العلمية من PubMed</h4>
      <p>
        أحدث 5 نتائج مرتبطة بـ
        <strong>${term}</strong>
      </p>
    `;

    articles.forEach(function (article) {

      const pmid =
        article.querySelector("PMID")?.textContent ||
        "";

      const title =
        article.querySelector("ArticleTitle")?.textContent ||
        "عنوان البحث غير متوفر";

      const journal =
        article.querySelector(
          "Journal Title"
        )?.textContent ||
        "المجلة غير متوفرة";

      const year =
        article.querySelector(
          "PubDate Year"
        )?.textContent ||
        article.querySelector(
          "PubDate MedlineDate"
        )?.textContent ||
        "غير متوفر";

      const abstractParts =
        Array.from(
          article.querySelectorAll(
            "AbstractText"
          )
        );

      const abstract =
        abstractParts
          .map(function (item) {
            return item.textContent;
          })
          .join(" ") ||
        "الملخص غير متوفر في السجل.";

      const shortAbstract =
        abstract.length > 500
          ? abstract.substring(0, 500) + "..."
          : abstract;

      html += `
        <div
          class="info-item"
          style="margin-top:15px;"
        >

          <strong>
            ${title}
          </strong>

          <p>
            📰 <strong>المجلة:</strong>
            ${journal}
          </p>

          <p>
            📅 <strong>السنة:</strong>
            ${year}
          </p>

          <p>
            📄 <strong>الملخص:</strong>
            ${shortAbstract}
          </p>

          ${
            pmid
              ? `
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/${pmid}/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🔗 قراءة البحث الكامل في PubMed
                </a>
              `
              : ""
          }

        </div>
      `;

    });

    box.innerHTML = html;

  } catch (error) {

    console.error(
      "MEDNEX PubMed error:",
      error
    );

    box.innerHTML = `
      <h4>🔬 الأبحاث العلمية</h4>
      <p>
        ⚠️ تعذر تحميل الأبحاث من PubMed حاليًا.
      </p>
    `;
  }
}
  
  window.showMedicineDetails = function (index) {

    const drug = medicines[index];

    if (!drug) return;

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
      "غير مذكور في السجل المتاح";

    const warnings =
      drug.warnings?.[0] ||
      drug.boxed_warning?.[0] ||
      "غير مذكور في السجل المتاح";

    const adverse =
      drug.adverse_reactions?.[0] ||
      "غير مذكورة في السجل الدوائي المتاح";

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
loadPubMedResearch(generic);

      <div class="medicine-card">

        <h3>💊 ${brand}</h3>

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
        <p>${purpose}</p>

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

        <div id="pubmedResearch" class="source-box">
  <p>🔬 جاري تحميل الأبحاث العلمية...</p>
</div>

<div class="source-box">

          <strong>📚 المصدر الرسمي</strong>

          <p>
            U.S. Food and Drug Administration —
            openFDA Drug Labeling
          </p>

          <a
            href="https://open.fda.gov/apis/drug/label/"
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 فتح المصدر
          </a>

        </div>

                <button
          onclick="location.reload()"
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

    loadPubMedResearch(generic);

  };

});
