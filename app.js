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
      "<p>🔎 جاري البحث في FDA و PubMed...</p>";

    try {

      // =========================
      // 1. FDA DRUG DATABASE
      // =========================

      const fdaUrl =
        "https://api.fda.gov/drug/label.json" +
        "?search=" +
        encodeURIComponent(
          'openfda.brand_name:"' +
          query +
          '" OR openfda.generic_name:"' +
          query +
          '"'
        ) +
        "&limit=5";

      const fdaResponse = await fetch(fdaUrl);

      let fdaData = null;

      if (fdaResponse.ok) {
        fdaData = await fdaResponse.json();
      }

      // =========================
      // 2. PUBMED SEARCH
      // =========================

      const pubmedSearchUrl =
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi" +
        "?db=pubmed" +
        "&term=" +
        encodeURIComponent(query) +
        "&retmode=json" +
        "&retmax=5";

      const pubmedSearchResponse =
        await fetch(pubmedSearchUrl);

      const pubmedSearchData =
        await pubmedSearchResponse.json();

      const articleIds =
        pubmedSearchData?.esearchresult?.idlist || [];

      let articles = [];

      // =========================
      // 3. GET PUBMED ARTICLES
      // =========================

      if (articleIds.length > 0) {

        const summaryUrl =
          "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi" +
          "?db=pubmed" +
          "&id=" +
          articleIds.join(",") +
          "&retmode=json";

        const summaryResponse =
          await fetch(summaryUrl);

        const summaryData =
          await summaryResponse.json();

        articles = articleIds.map(function (id) {

          const article = summaryData.result?.[id];

          if (!article) {
            return null;
          }

          return {
            id: id,
            title: article.title || "عنوان غير متوفر",
            journal: article.fulljournalname || "",
            date: article.pubdate || ""
          };

        }).filter(Boolean);
      }

      // =========================
      // 4. DISPLAY FDA DATA
      // =========================

      let html = "";

      if (fdaData?.results?.length > 0) {

        html += fdaData.results.map(function (drug) {

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
                  U.S. FDA — openFDA Drug Labeling
                </p>

                <a
                  href="https://open.fda.gov/apis/drug/label/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  المصدر الرسمي
                </a>

              </div>

            </div>
          `;

        }).join("");

      } else {

        html += `
          <div class="medicine-card">
            <h3>💊 معلومات الدواء</h3>
            <p>
              لم نجد بطاقة دوائية مطابقة في FDA.
              لكن يمكننا البحث عن الدراسات العلمية.
            </p>
          </div>
        `;
      }

      // =========================
      // 5. PUBMED ARTICLES
      // =========================

      html += `
        <div class="medicine-card">

          <h3>🔬 الأبحاث العلمية — PubMed</h3>

          <p>
            أحدث النتائج المتعلقة بـ:
            <strong>${query}</strong>
          </p>
      `;

      if (articles.length > 0) {

        articles.forEach(function (article) {

          html += `
            <div style="
              margin-top:15px;
              padding:12px;
              border:1px solid #ddd;
              border-radius:8px;
            ">

              <h4>
                ${article.title}
              </h4>

              <p>
                📰 ${article.journal}
              </p>

              <p>
                📅 ${article.date}
              </p>

              <a
                href="https://pubmed.ncbi.nlm.nih.gov/${article.id}/"
                target="_blank"
                rel="noopener noreferrer"
              >
                🔗 قراءة الدراسة في PubMed
              </a>

            </div>
          `;

        });

      } else {

        html += `
          <p>
            لم نجد أبحاثًا مطابقة حاليًا.
          </p>
        `;
      }

      html += `

          <div style="
            margin-top:20px;
            padding:12px;
            background:#f4f4f4;
            border-radius:8px;
          ">

            <strong>📚 المصدر</strong>

            <p>
              PubMed — National Library of Medicine /
              National Institutes of Health
            </p>

            <a
              href="https://pubmed.ncbi.nlm.nih.gov/"
              target="_blank"
              rel="noopener noreferrer"
            >
              فتح PubMed
            </a>

          </div>

        </div>
      `;

      results.innerHTML = html;

    } catch (error) {

      console.error(error);

      results.innerHTML = `
        <div class="medicine-card">

          <h3>⚠️ حدث خطأ</h3>

          <p>
            تعذر الاتصال بمصادر المعلومات حاليًا.
          </p>

          <p>
            حاول مرة أخرى.
          </p>

        </div>
      `;
    }

  }

});
