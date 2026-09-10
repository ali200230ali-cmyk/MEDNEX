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

  /*
   * ============================
   * MEDICINE SYNONYMS
   * ============================
   */

  const synonyms = {
    "paracetamol": "acetaminophen",
    "باراسيتامول": "acetaminophen",
    "بانادول": "panadol",
    "acetaminophen": "acetaminophen",
    "panadol": "panadol",

    "اوميبرازول": "omeprazole",
    "أوميبرازول": "omeprazole",
    "omeprazole": "omeprazole",

    "ايبوبروفين": "ibuprofen",
    "إيبوبروفين": "ibuprofen",
    "ibuprofen": "ibuprofen",

    "اموكسيسيلين": "amoxicillin",
    "أموكسيسيلين": "amoxicillin",
    "amoxicillin": "amoxicillin"
  };


  /*
   * ============================
   * SEARCH FDA
   * ============================
   */

  async function searchMedicine() {

    const searchTerm = searchInput.value.trim();

    if (!searchTerm) {

      results.innerHTML = `
        <div class="medicine-card">
          <p>اكتب اسم الدواء أولاً.</p>
        </div>
      `;

      return;
    }

    results.innerHTML = `
      <div class="loading">
        🔎 جاري البحث عن الدواء...
      </div>
    `;

    const term =
      synonyms[searchTerm.toLowerCase()] || searchTerm;

    try {

      const url =
        "https://api.fda.gov/drug/label.json?search=" +
        encodeURIComponent(
          'openfda.brand_name:"' +
          term +
          '" OR openfda.generic_name:"' +
          term +
          '"'
        ) +
        "&limit=10";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("FDA API error");
      }

      const data = await response.json();

      medicines = data.results || [];

      if (medicines.length === 0) {

        results.innerHTML = `
          <div class="medicine-card">
            <p>❌ لم يتم العثور على نتائج.</p>
            <p>جرّب الاسم العلمي أو التجاري للدواء.</p>
          </div>
        `;

        return;
      }

      results.innerHTML =
        medicines.map(function (medicine, index) {

          const brand =
            medicine.openfda?.brand_name?.[0] ||
            "غير معروف";

          const generic =
            medicine.openfda?.generic_name?.[0] ||
            "غير معروف";

          const manufacturer =
            medicine.openfda?.manufacturer_name?.[0] ||
            "غير معروف";

          return `
            <div class="medicine-card">

              <h3>${escapeHTML(brand)}</h3>

              <p>
                <strong>المادة الفعالة:</strong>
                ${escapeHTML(generic)}
              </p>

              <p>
                <strong>الشركة:</strong>
                ${escapeHTML(manufacturer)}
              </p>

              <button onclick="showMedicineDetails(${index})">
                عرض التفاصيل
              </button>

            </div>
          `;

        }).join("");

    } catch (error) {

      console.error("FDA error:", error);

      results.innerHTML = `
        <div class="medicine-card">

          <p>⚠️ حدث خطأ أثناء البحث.</p>

          <p>
            تعذر الاتصال بمصدر معلومات الدواء حاليًا.
          </p>

          <p>
            حاول مرة أخرى بعد قليل.
          </p>

        </div>
      `;
    }
  }


  /*
   * ============================
   * MEDICINE DETAILS
   * ============================
   */

  window.showMedicineDetails = function (index) {

    const medicine = medicines[index];

    if (!medicine) {
      return;
    }

    const brand =
      medicine.openfda?.brand_name?.[0] ||
      "غير معروف";

    const generic =
      medicine.openfda?.generic_name?.[0] ||
      "غير معروف";

    const manufacturer =
      medicine.openfda?.manufacturer_name?.[0] ||
      "غير معروف";

    const purpose =
      medicine.purpose?.[0] ||
      medicine.indications_and_usage?.[0] ||
      "لا توجد معلومات متاحة.";

    const warnings =
      medicine.warnings?.[0] ||
      "لا توجد معلومات متاحة.";

    const adverse =
      medicine.adverse_reactions?.[0] ||
      "لا توجد معلومات متاحة.";

    const contraindications =
      medicine.contraindications?.[0] ||
      "لا توجد معلومات متاحة.";

    const dosage =
      medicine.dosage_and_administration?.[0] ||
      "لا توجد معلومات متاحة.";

    const interactions =
      medicine.drug_interactions?.[0] ||
      "لا توجد معلومات متاحة.";


    results.innerHTML = `

      <div class="medicine-card">

        <h2>${escapeHTML(brand)}</h2>

        <p>
          <strong>المادة الفعالة:</strong>
          ${escapeHTML(generic)}
        </p>

        <p>
          <strong>الشركة المصنعة:</strong>
          ${escapeHTML(manufacturer)}
        </p>

        <hr>

        <h3>💊 الاستخدامات</h3>
        <p>${escapeHTML(purpose)}</p>

        <h3>⚠️ التحذيرات</h3>
        <p>${escapeHTML(warnings)}</p>

        <h3>🚫 موانع الاستعمال</h3>
        <p>${escapeHTML(contraindications)}</p>

        <h3>💥 الآثار الجانبية</h3>
        <p>${escapeHTML(adverse)}</p>

        <h3>📋 الجرعة وطريقة الاستخدام</h3>
        <p>${escapeHTML(dosage)}</p>

        <h3>🔄 التداخلات الدوائية</h3>
        <p>${escapeHTML(interactions)}</p>

        <div
          id="pubmedResearch"
          class="source-box"
        >

          <p>
            🔬 جاري تحليل الأدلة العلمية...
          </p>

        </div>

        <div class="source-box">

          <p>
            📚 مصدر معلومات الدواء:
            U.S. FDA / openFDA
          </p>

          <p>
            🔬 مصدر الأبحاث:
            PubMed / NCBI
          </p>

        </div>

      </div>
    `;

    loadPubMedResearch(generic);
  };


  /*
   * ============================
   * PUBMED RESEARCH
   * ============================
   */

  async function loadPubMedResearch(term) {

    const container =
      document.getElementById("pubmedResearch");

    if (!container) {
      return;
    }

    try {

      const cleanTerm =
        term
          .replace(/\[[^\]]*\]/g, "")
          .trim();

      /*
       * نبحث عن اسم الدواء نفسه
       * داخل Title/Abstract.
       *
       * ثم نعطي أولوية لأنواع الدراسات
       * الأكثر فائدة للمستخدم الصيدلاني.
       */

      const searchQuery =
        '("' +
        cleanTerm +
        '"[Title/Abstract]) AND (' +

        'clinical trial[pt] OR ' +
        'randomized controlled trial[pt] OR ' +
        'systematic review[pt] OR ' +
        'meta-analysis[pt] OR ' +
        'review[pt] OR ' +
        'observational study[pt]' +

        ')';


      const searchUrl =
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi" +

        "?db=pubmed" +

        "&term=" +
        encodeURIComponent(searchQuery) +

        "&retmode=json" +

        "&retmax=12" +

        "&sort=date" +

        "&tool=MEDNEX" +

        "&email=mednex.app@example.com";


      const searchResponse =
        await fetch(searchUrl);


      if (!searchResponse.ok) {
        throw new Error("PubMed search error");
      }


      const searchData =
        await searchResponse.json();


      const ids =
        searchData.esearchresult?.idlist || [];


      if (ids.length === 0) {

        container.innerHTML = `

          <h3>🔬 الأبحاث العلمية</h3>

          <p>
            لم يتم العثور على أبحاث بشرية مناسبة مرتبطة مباشرة بهذا الدواء.
          </p>

          <p>
            يمكنك البحث عنه مباشرة في PubMed.
          </p>

        `;

        return;
      }


      /*
       * جلب تفاصيل الأبحاث
       */

      const fetchUrl =

        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi" +

        "?db=pubmed" +

        "&id=" +
        ids.join(",") +

        "&retmode=xml" +

        "&tool=MEDNEX" +

        "&email=mednex.app@example.com";


      const fetchResponse =
        await fetch(fetchUrl);


      if (!fetchResponse.ok) {
        throw new Error("PubMed fetch error");
      }


      const xmlText =
        await fetchResponse.text();


      const parser =
        new DOMParser();


      const xml =
        parser.parseFromString(
          xmlText,
          "text/xml"
        );


      const articles =
        Array.from(
          xml.querySelectorAll("PubmedArticle")
        );


      /*
       * ترتيب الأدلة
       */

      const articleData =
        articles.map(function (article) {

          const pmid =
            article.querySelector("PMID")?.textContent ||
            "";

          const title =
            article.querySelector("ArticleTitle")?.textContent ||
            "بدون عنوان";


          const journal =
            article.querySelector("Journal Title")?.textContent ||
            "مجلة غير معروفة";


          const year =
            article.querySelector("PubDate Year")?.textContent ||
            article.querySelector("PubDate MedlineDate")?.textContent ||
            "";


          const abstractParts =
            Array.from(
              article.querySelectorAll("AbstractText")
            );


          const abstract =
            abstractParts
              .map(function (item) {
                return item.textContent;
              })
              .join(" ") ||
            "لا يوجد ملخص متاح.";


          const publicationTypes =
            Array.from(
              article.querySelectorAll("PublicationType")
            )
            .map(function (item) {
              return item.textContent;
            });


          const lowerTitle =
            title.toLowerCase();


          const lowerAbstract =
            abstract.toLowerCase();


          /*
           * تصنيف الدراسة
           */

          let studyType =
            "📄 دراسة علمية";


          let priority =
            1;


          if (
            publicationTypes.includes(
              "Meta-Analysis"
            )
          ) {

            studyType =
              "📊 تحليل تلوي";

            priority = 6;

          } else if (
            publicationTypes.includes(
              "Systematic Review"
            )
          ) {

            studyType =
              "📚 مراجعة منهجية";

            priority = 5;

          } else if (
            publicationTypes.includes(
              "Randomized Controlled Trial"
            )
          ) {

            studyType =
              "🩺 تجربة سريرية عشوائية";

            priority = 5;

          } else if (
            publicationTypes.includes(
              "Clinical Trial"
            )
          ) {

            studyType =
              "🩺 تجربة سريرية";

            priority = 4;

          } else if (
            publicationTypes.includes(
              "Observational Study"
            )
          ) {

            studyType =
              "📊 دراسة رصدية";

            priority = 3;

          } else if (
            publicationTypes.includes(
              "Review"
            )
          ) {

            studyType =
              "📚 مراجعة علمية";

            priority = 3;
          }


          /*
           * هل الدواء مذكور بوضوح؟
           */

          const drugName =
            cleanTerm.toLowerCase();


          const directMention =
            lowerTitle.includes(drugName);


          /*
           * إذا ظهر اسم الدواء في العنوان
           * نعتبره أكثر ارتباطًا مباشرة.
           */

          if (directMention) {
            priority += 3;
          }


          /*
           * البحث عن مؤشرات تدل على دراسة
           * للفئة الدوائية وليس الدواء فقط.
           */

          const classTerms = [

            "proton pump inhibitor",
            "proton pump inhibitors",
            "ppi",
            "ppis",
            "drug class",
            "class effect"

          ];


          const classLevel =
            classTerms.some(function (word) {

              return (
                lowerTitle.includes(word) ||
                lowerAbstract.includes(word)
              );

            });


          return {

            pmid,
            title,
            journal,
            year,
            abstract,
            publicationTypes,
            studyType,
            priority,
            directMention,
            classLevel

          };

        });


      /*
       * ترتيب النتائج
       */

      articleData.sort(function (a, b) {

        return b.priority - a.priority;

      });


      /*
       * عرض النتائج
       */

      let html = `

        <h3>
          🔬 الأدلة والأبحاث العلمية
        </h3>

        <p>
          نتائج مرتبطة باسم الدواء من PubMed / NCBI
        </p>

      `;


      articleData
        .slice(0, 8)
        .forEach(function (article) {


          let evidenceLabel =
            "🔎 دليل مرتبط بالدواء";


          if (article.directMention) {

            evidenceLabel =
              "🎯 دليل مباشر — اسم الدواء في عنوان الدراسة";

          } else if (article.classLevel) {

            evidenceLabel =
              "📚 دليل على الفئة الدوائية — قد يكون غير مباشر";

          }


          html += `

            <div class="research-card">

              <h4>
                ${escapeHTML(article.title)}
              </h4>

              <p>
                <strong>
                  نوع الدراسة:
                </strong>
                ${article.studyType}
              </p>

              <p>
                <strong>
                  مستوى الارتباط:
                </strong>
                ${evidenceLabel}
              </p>

              <p>
                <strong>
                  المجلة:
                </strong>
                ${escapeHTML(article.journal)}
              </p>

              <p>
                <strong>
                  السنة:
                </strong>
                ${escapeHTML(article.year)}
              </p>

              <p>
                ${escapeHTML(
                  article.abstract.substring(0, 500)
                )}
                ${
                  article.abstract.length > 500
                    ? "..."
                    : ""
                }
              </p>

              <a
                href="https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(article.pmid)}/"
                target="_blank"
                rel="noopener noreferrer"
              >
                قراءة الدراسة على PubMed
              </a>

            </div>

          `;

        });


      html += `

        <div class="source-box">

          <p>
            📚 المصدر:
            PubMed / National Library of Medicine
          </p>

          <p>
            ملاحظة: تصنيف نوع الدراسة لا يعني
            تلقائيًا أن الدليل عالي الجودة.
          </p>

        </div>

      `;


      container.innerHTML =
        html;


    } catch (error) {

      console.error(
        "PubMed error:",
        error
      );


      container.innerHTML = `

        <h3>
          🔬 الأبحاث العلمية
        </h3>

        <p>
          ⚠️ تعذر تحميل الأبحاث العلمية حاليًا.
        </p>

        <p>
          حاول مرة أخرى بعد قليل.
        </p>

      `;

    }

  }


  /*
   * ============================
   * SECURITY
   * ============================
   */

  function escapeHTML(value) {

    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

});
