document.addEventListener("DOMContentLoaded", function () {

  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("medicineSearch");
  const results = document.getElementById("results");

  let localMedicines = [];
  let medicines = [];

  /*
   * ============================
   * LOAD MEDNEX DATABASE
   * ============================
   */

  async function loadLocalDatabase() {

    try {

      const response =
        await fetch("data/cardiovascular.json");

      if (!response.ok) {
        throw new Error("Database loading error");
      }

      localMedicines =
        await response.json();

      console.log(
        "MEDNEX database loaded:",
        localMedicines.length
      );

    } catch (error) {

      console.error(
        "MEDNEX database error:",
        error
      );

      localMedicines = [];
    }
  }


  /*
   * ============================
   * START
   * ============================
   */

  loadLocalDatabase();


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
    "amoxicillin": "amoxicillin",

    "املوديبين": "amlodipine",
    "أملوديبين": "amlodipine",
    "amlodipine": "amlodipine",

    "ليسينوبريل": "lisinopril",
    "ليزينوبريل": "lisinopril",
    "lisinopril": "lisinopril",

    "لوسارتان": "losartan",
    "losartan": "losartan",

    "اتورفاستاتين": "atorvastatin",
    "أتورفاستاتين": "atorvastatin",
    "atorvastatin": "atorvastatin",

    "فوروسيميد": "furosemide",
    "فوروسمايد": "furosemide",
    "furosemide": "furosemide"
  };


  /*
   * ============================
   * SEARCH BUTTON
   * ============================
   */

  searchButton.addEventListener(
    "click",
    searchMedicine
  );


  searchInput.addEventListener(
    "keydown",
    function (event) {

      if (event.key === "Enter") {
        searchMedicine();
      }

    }
  );


  /*
   * ============================
   * SEARCH MEDICINE
   * ============================
   */

  async function searchMedicine() {

    const searchTerm =
      searchInput.value.trim();

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
        🔎 جاري البحث في قاعدة MEDNEX...
      </div>
    `;


    const normalized =
      searchTerm.toLowerCase();

    const term =
      synonyms[normalized] ||
      normalized;


    /*
     * ============================
     * SEARCH LOCAL DATABASE
     * ============================
     */

    const localResults =
      localMedicines.filter(
        function (medicine) {

          const generic =
            (
              medicine.genericName ||
              ""
            ).toLowerCase();

          const arabic =
            (
              medicine.arabicName ||
              ""
            ).toLowerCase();

          const className =
            (
              medicine.class ||
              ""
            ).toLowerCase();

          const therapeutic =
            (
              medicine.therapeuticClass ||
              ""
            ).toLowerCase();


          return (

            generic.includes(term) ||

            arabic.includes(searchTerm) ||

            className.includes(term) ||

            therapeutic.includes(term)

          );

        }
      );


    /*
     * LOCAL DATABASE RESULTS
     */

    if (localResults.length > 0) {

      medicines =
        localResults.map(
          function (medicine) {

            return {
              type: "local",
              data: medicine
            };

          }
        );


      displayLocalResults();

      return;
    }


    /*
     * ============================
     * IF NOT FOUND LOCALLY
     * SEARCH FDA
     * ============================
     */

    await searchFDA(term);

  }


  /*
   * ============================
   * DISPLAY LOCAL RESULTS
   * ============================
   */

  function displayLocalResults() {

    results.innerHTML = `

      <div class="source-box">

        <p>
          🗂️ نتائج من قاعدة MEDNEX
        </p>

        <p>
          الجهاز: القلب والأوعية الدموية
        </p>

      </div>

    `;


    medicines.forEach(
      function (item, index) {

        const medicine =
          item.data;


        results.innerHTML += `

          <div class="medicine-card">

            <h3>
              💊
              ${escapeHTML(
                medicine.genericName
              )}
            </h3>

            <p>
              <strong>
                الاسم بالعربي:
              </strong>

              ${escapeHTML(
                medicine.arabicName
              )}
            </p>

            <p>
              <strong>
                الفئة الدوائية:
              </strong>

              ${escapeHTML(
                medicine.class
              )}
            </p>

            <p>
              <strong>
                الفئة العلاجية:
              </strong>

              ${escapeHTML(
                medicine.therapeuticClass
              )}
            </p>

            <p>
              <strong>
                الأشكال الدوائية:
              </strong>

              ${escapeHTML(
                Array.isArray(
                  medicine.dosageForms
                )
                  ? medicine.dosageForms.join("، ")
                  : medicine.dosageForms || ""
              )}
            </p>

            <button
              onclick="showLocalMedicineDetails(${index})"
            >
              عرض التفاصيل
            </button>

          </div>

        `;

      }
    );

  }


  /*
   * ============================
   * LOCAL MEDICINE DETAILS
   * ============================
   */

  window.showLocalMedicineDetails =
    function (index) {

      const item =
        medicines[index];

      if (!item || item.type !== "local") {
        return;
      }

      const medicine =
        item.data;


      results.innerHTML = `

        <div class="medicine-card">

          <button
            onclick="backToResults()"
          >
            ← رجوع إلى النتائج
          </button>

          <h2>
            💊
            ${escapeHTML(
              medicine.genericName
            )}
          </h2>

          <p>
            <strong>
              الاسم العربي:
            </strong>

            ${escapeHTML(
              medicine.arabicName
            )}
          </p>


          <hr>


          <h3>
            🧬 التصنيف الدوائي
          </h3>

          <p>
            <strong>
              الفئة الدوائية:
            </strong>

            ${escapeHTML(
              medicine.class
            )}
          </p>

          <p>
            <strong>
              الفئة العلاجية:
            </strong>

            ${escapeHTML(
              medicine.therapeuticClass
            )}
          </p>


          <h3>
            💊 القوة
          </h3>

          <p>
            ${escapeHTML(
              Array.isArray(
                medicine.strengths
              )
                ? medicine.strengths.join("، ")
                : medicine.strengths || ""
            )}
          </p>


          <h3>
            📦 الشكل الصيدلاني
          </h3>

          <p>
            ${escapeHTML(
              Array.isArray(
                medicine.dosageForms
              )
                ? medicine.dosageForms.join("، ")
                : medicine.dosageForms || ""
            )}
          </p>


          <h3>
            🎯 الاستخدامات
          </h3>

          <p>
            ${escapeHTML(
              Array.isArray(
                medicine.indications
              )
                ? medicine.indications.join("، ")
                : medicine.indications || ""
            )}
          </p>


          <h3>
            ⚙️ آلية العمل
          </h3>

          <p>
            ${escapeHTML(
              medicine.mechanism
            )}
          </p>


          <h3>
            🚫 موانع الاستعمال
          </h3>

          <p>
            ${escapeHTML(
              Array.isArray(
                medicine.contraindications
              )
                ? medicine.contraindications.join("، ")
                : medicine.contraindications || ""
            )}
          </p>


          <h3>
            ⚠️ التحذيرات
          </h3>

          <p>
            ${escapeHTML(
              Array.isArray(
                medicine.warnings
              )
                ? medicine.warnings.join("، ")
                : medicine.warnings || ""
            )}
          </p>


          <h3>
            💥 الآثار الجانبية
          </h3>

          <p>
            ${escapeHTML(
              Array.isArray(
                medicine.adverseEffects
              )
                ? medicine.adverseEffects.join("، ")
                : medicine.adverseEffects || ""
            )}
          </p>


          <h3>
            📋 الجرعة
          </h3>

          <p>
            ${escapeHTML(
              medicine.dosage
            )}
          </p>


          <h3>
            🧪 تعديل الجرعة في أمراض الكلى
          </h3>

          <p>
            ${escapeHTML(
              medicine.renalAdjustment
            )}
          </p>


          <h3>
            🧪 تعديل الجرعة في أمراض الكبد
          </h3>

          <p>
            ${escapeHTML(
              medicine.hepaticAdjustment
            )}
          </p>


          <h3>
            🔄 التداخلات الدوائية
          </h3>

          <p>
            ${escapeHTML(
              Array.isArray(
                medicine.interactions
              )
                ? medicine.interactions.join("، ")
                : medicine.interactions || ""
            )}
          </p>


          <h3>
            🤰 الحمل والرضاعة
          </h3>

          <p>
            ${escapeHTML(
              medicine.pregnancy
            )}
          </p>


          <h3>
            🩺 المتابعة
          </h3>

          <p>
            ${escapeHTML(
              Array.isArray(
                medicine.monitoring
              )
                ? medicine.monitoring.join("، ")
                : medicine.monitoring || ""
            )}
          </p>


          <div class="source-box">

            <h3>
              📚 المصادر
            </h3>

            <p>
              ${escapeHTML(
                Array.isArray(
                  medicine.sources
                )
                  ? medicine.sources.join("، ")
                  : medicine.sources || ""
              )}
            </p>

          </div>


          <div
            id="pubmedResearch"
            class="source-box"
          >

            <p>
              🔬 جاري البحث عن أحدث الدراسات...
            </p>

          </div>

        </div>

      `;


      loadPubMedResearch(
        medicine.genericName
      );

    };


  /*
   * ============================
   * BACK TO RESULTS
   * ============================
   */

  window.backToResults =
    function () {

      displayLocalResults();

    };


  /*
   * ============================
   * FDA SEARCH
   * ============================
   */

  async function searchFDA(term) {

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


      const response =
        await fetch(url);


      if (!response.ok) {
        throw new Error(
          "FDA API error"
        );
      }


      const data =
        await response.json();


      const fdaResults =
        data.results || [];


      if (fdaResults.length === 0) {

        results.innerHTML = `

          <div class="medicine-card">

            <p>
              ❌ لم يتم العثور على الدواء.
            </p>

            <p>
              جرّب الاسم العلمي أو التجاري.
            </p>

          </div>

        `;

        return;
      }


      medicines =
        fdaResults.map(
          function (medicine) {

            return {
              type: "fda",
              data: medicine
            };

          }
        );


      results.innerHTML =
        medicines.map(
          function (item, index) {

            const medicine =
              item.data;


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

                <h3>
                  ${escapeHTML(
                    brand
                  )}
                </h3>

                <p>
                  <strong>
                    المادة الفعالة:
                  </strong>

                  ${escapeHTML(
                    generic
                  )}
                </p>

                <p>
                  <strong>
                    الشركة:
                  </strong>

                  ${escapeHTML(
                    manufacturer
                  )}
                </p>

                <button
                  onclick="showMedicineDetails(${index})"
                >
                  عرض التفاصيل
                </button>

              </div>

            `;

          }
        ).join("");


    } catch (error) {

      console.error(
        "FDA error:",
        error
      );


      results.innerHTML = `

        <div class="medicine-card">

          <p>
            ⚠️ تعذر الاتصال بمصدر FDA.
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
   * FDA DETAILS
   * ============================
   */

  window.showMedicineDetails =
    function (index) {

      const item =
        medicines[index];


      if (!item || item.type !== "fda") {
        return;
      }


      const medicine =
        item.data;


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

          <button
            onclick="backToFDAResults()"
          >
            ← رجوع
          </button>

          <h2>
            ${escapeHTML(brand)}
          </h2>

          <p>
            <strong>
              المادة الفعالة:
            </strong>

            ${escapeHTML(generic)}
          </p>

          <p>
            <strong>
              الشركة المصنعة:
            </strong>

            ${escapeHTML(manufacturer)}
          </p>


          <hr>


          <h3>
            💊 الاستخدامات
          </h3>

          <p>
            ${escapeHTML(purpose)}
          </p>


          <h3>
            ⚠️ التحذيرات
          </h3>

          <p>
            ${escapeHTML(warnings)}
          </p>


          <h3>
            🚫 موانع الاستعمال
          </h3>

          <p>
            ${escapeHTML(contraindications)}
          </p>


          <h3>
            💥 الآثار الجانبية
          </h3>

          <p>
            ${escapeHTML(adverse)}
          </p>


          <h3>
            📋 الجرعة وطريقة الاستخدام
          </h3>

          <p>
            ${escapeHTML(dosage)}
          </p>


          <h3>
            🔄 التداخلات الدوائية
          </h3>

          <p>
            ${escapeHTML(interactions)}
          </p>


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


      loadPubMedResearch(
        generic
      );

    };


  window.backToFDAResults =
    function () {

      searchFDA(
        searchInput.value.trim()
      );

    };


  /*
   * ============================
   * PUBMED
   * ============================
   */

  async function loadPubMedResearch(term) {

    const container =
      document.getElementById(
        "pubmedResearch"
      );


    if (!container) {
      return;
    }


    try {

      const cleanTerm =
        term
          .replace(/\[[^\]]*\]/g, "")
          .trim();


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
        encodeURIComponent(
          searchQuery
        ) +

        "&retmode=json" +

        "&retmax=12" +

        "&sort=date";


      const searchResponse =
        await fetch(
          searchUrl
        );


      if (!searchResponse.ok) {
        throw new Error(
          "PubMed search error"
        );
      }


      const searchData =
        await searchResponse.json();


      const ids =
        searchData.esearchresult?.idlist ||
        [];


      if (ids.length === 0) {

        container.innerHTML = `

          <h3>
            🔬 الأبحاث العلمية
          </h3>

          <p>
            لم يتم العثور على أبحاث مناسبة.
          </p>

        `;

        return;
      }


      const fetchUrl =
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi" +

        "?db=pubmed" +

        "&id=" +
        ids.join(",") +

        "&retmode=xml";


      const fetchResponse =
        await fetch(
          fetchUrl
        );


      if (!fetchResponse.ok) {
        throw new Error(
          "PubMed fetch error"
        );
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
          xml.querySelectorAll(
            "PubmedArticle"
          )
        );


      const articleData =
        articles.map(
          function (article) {

            const pmid =
              article.querySelector(
                "PMID"
              )?.textContent || "";


            const title =
              article.querySelector(
                "ArticleTitle"
              )?.textContent ||
              "بدون عنوان";


            const journal =
              article.querySelector(
                "Journal Title"
              )?.textContent ||
              "مجلة غير معروفة";


            const year =
              article.querySelector(
                "PubDate Year"
              )?.textContent ||
              "";


            const abstract =
              Array.from(
                article.querySelectorAll(
                  "AbstractText"
                )
              )
              .map(
                function (item) {
                  return item.textContent;
                }
              )
              .join(" ") ||
              "لا يوجد ملخص متاح.";


            const publicationTypes =
              Array.from(
                article.querySelectorAll(
                  "PublicationType"
                )
              )
              .map(
                function (item) {
                  return item.textContent;
                }
              );


            let studyType =
              "📄 دراسة علمية";


            if (
              publicationTypes.includes(
                "Meta-Analysis"
              )
            ) {

              studyType =
                "📊 تحليل تلوي";

            } else if (
              publicationTypes.includes(
                "Systematic Review"
              )
            ) {

              studyType =
                "📚 مراجعة منهجية";

            } else if (
              publicationTypes.includes(
                "Randomized Controlled Trial"
              )
            ) {

              studyType =
                "🩺 تجربة سريرية عشوائية";

            } else if (
              publicationTypes.includes(
                "Clinical Trial"
              )
            ) {

              studyType =
                "🩺 تجربة سريرية";

            } else if (
              publicationTypes.includes(
                "Observational Study"
              )
            ) {

              studyType =
                "📊 دراسة رصدية";

            } else if (
              publicationTypes.includes(
                "Review"
              )
            ) {

              studyType =
                "📚 مراجعة علمية";

            }


            return {

              pmid,
              title,
              journal,
              year,
              abstract,
              studyType

            };

          }
        );


      let html = `

        <h3>
          🔬 أحدث الأبحاث العلمية
        </h3>

        <p>
          نتائج من PubMed / NCBI
        </p>

      `;


      articleData
        .slice(0, 8)
        .forEach(
          function (article) {

            html += `

              <div class="research-card">

                <h4>
                  ${escapeHTML(
                    article.title
                  )}
                </h4>

                <p>
                  <strong>
                    نوع الدراسة:
                  </strong>

                  ${article.studyType}
                </p>

                <p>
                  <strong>
                    المجلة:
                  </strong>

                  ${escapeHTML(
                    article.journal
                  )}
                </p>

                <p>
                  <strong>
                    السنة:
                  </strong>

                  ${escapeHTML(
                    article.year
                  )}
                </p>

                <p>
                  ${escapeHTML(
                    article.abstract.substring(
                      0,
                      500
                    )
                  )}
                  ${
                    article.abstract.length > 500
                      ? "..."
                      : ""
                  }
                </p>

                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(
                    article.pmid
                  )}/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  قراءة الدراسة على PubMed
                </a>

              </div>

            `;

          }
        );


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
          ⚠️ تعذر تحميل الأبحاث حاليًا.
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

    if (
      value === null ||
      value === undefined
    ) {

      return "";

    }


    return String(value)

      .replace(
        /&/g,
        "&amp;"
      )

      .replace(
        /</g,
        "&lt;"
      )

      .replace(
        />/g,
        "&gt;"
      )

      .replace(
        /"/g,
        "&quot;"
      )

      .replace(
        /'/g,
        "&#039;"
      );

  }

});
