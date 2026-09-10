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


  // ==============================
  // البحث عن الدواء في FDA
  // ==============================

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


    const synonyms = {
      "paracetamol": "acetaminophen",
      "باراسيتامول": "acetaminophen",
      "بنادول": "panadol",
      "بانادول": "panadol",
      "acetaminophen": "acetaminophen",
      "panadol": "panadol",
      "omeprazole": "omeprazole"
    };


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
            <p>❌ لم يتم العثور على الدواء.</p>
            <p>جرّب الاسم العلمي أو التجاري باللغة الإنجليزية.</p>
          </div>
        `;

        return;
      }


      results.innerHTML = medicines.map(function (medicine, index) {

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

            <h3>${brand}</h3>

            <p>
              <strong>المادة الفعالة:</strong>
              ${generic}
            </p>

            <p>
              <strong>الشركة:</strong>
              ${manufacturer}
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

          <p>⚠️ حدث خطأ أثناء الاتصال بقاعدة بيانات FDA.</p>

          <p>
            تأكد من اتصال الإنترنت وحاول مرة أخرى.
          </p>

        </div>
      `;
    }
  }



  // ==============================
  // تفاصيل الدواء
  // ==============================

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
      "لا توجد معلومات متاحة";


    const warnings =
      medicine.warnings?.[0] ||
      "لا توجد معلومات متاحة";


    const adverse =
      medicine.adverse_reactions?.[0] ||
      "لا توجد معلومات متاحة";


    const contraindications =
      medicine.contraindications?.[0] ||
      "لا توجد معلومات متاحة";


    const dosage =
      medicine.dosage_and_administration?.[0] ||
      "لا توجد معلومات متاحة";


    const interactions =
      medicine.drug_interactions?.[0] ||
      "لا توجد معلومات متاحة";


    results.innerHTML = `

      <div class="medicine-card">

        <h2>${brand}</h2>

        <p>
          <strong>المادة الفعالة:</strong>
          ${generic}
        </p>

        <p>
          <strong>الشركة المصنعة:</strong>
          ${manufacturer}
        </p>

        <hr>


        <h3>💊 الاستخدامات</h3>
        <p>${purpose}</p>


        <h3>⚠️ التحذيرات</h3>
        <p>${warnings}</p>


        <h3>🚫 موانع الاستعمال</h3>
        <p>${contraindications}</p>


        <h3>💥 الآثار الجانبية</h3>
        <p>${adverse}</p>


        <h3>📋 الجرعة وطريقة الاستخدام</h3>
        <p>${dosage}</p>


        <h3>🔄 التداخلات الدوائية</h3>
        <p>${interactions}</p>


        <div
          id="pubmedResearch"
          class="source-box"
        >
          <p>
            🔬 جاري البحث عن الدراسات العلمية...
          </p>
        </div>


        <div class="source-box">

          <p>
            📚 المصدر الأساسي:
            U.S. FDA / openFDA
          </p>

          <p>
            🔬 الأبحاث:
            PubMed / National Library of Medicine
          </p>

        </div>

      </div>
    `;


    loadPubMedResearch(generic);
  };



  // ==============================
  // البحث العلمي في PubMed
  // ==============================

  async function loadPubMedResearch(term) {

    const container =
      document.getElementById("pubmedResearch");


    if (!container) {
      return;
    }


    try {

      /*
       نبحث عن المادة الفعالة نفسها
       بدلاً من البحث العام عن كلمة drug.
      */

      const searchTerm =
        `"${term}" AND
        (clinical trial[pt] OR
        randomized controlled trial[pt] OR
        systematic review[pt] OR
        meta-analysis[pt] OR
        review[pt])`;


      const searchUrl =
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi" +

        "?db=pubmed" +

        "&term=" +
        encodeURIComponent(searchTerm) +

        "&retmode=json" +

        "&retmax=8" +

        "&sort=date";


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
            لم يتم العثور على دراسات سريرية أو
            مراجعات مرتبطة مباشرة بالمادة الفعالة.
          </p>

        `;

        return;
      }



      // جلب تفاصيل الدراسات

      const fetchUrl =
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi" +

        "?db=pubmed" +

        "&id=" +
        ids.join(",") +

        "&retmode=xml";


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


      let html = `

        <h3>
          🔬 أحدث الأبحاث العلمية
        </h3>

        <p>
          نتائج مرتبطة بالمادة الفعالة:
          <strong>${term}</strong>
        </p>

      `;



      articles.forEach(function (article) {

        const pmid =
          article.querySelector("PMID")
            ?.textContent || "";


        const title =
          article.querySelector("ArticleTitle")
            ?.textContent ||
          "بدون عنوان";


        const journal =
          article.querySelector("Journal Title")
            ?.textContent ||
          "مجلة غير معروفة";


        const year =
          article.querySelector("PubDate Year")
            ?.textContent ||

          article.querySelector("PubDate MedlineDate")
            ?.textContent ||

          "";



        // الملخص

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



        // نوع الدراسة

        const publicationTypes =
          Array.from(
            article.querySelectorAll("PublicationType")
          )
          .map(function (item) {
            return item.textContent;
          });



        let studyType =
          "📄 نوع الدراسة غير محدد";


        if (
          publicationTypes.includes(
            "Meta-Analysis"
          )
        ) {

          studyType =
            "📊 تحليل تلوي";

        }

        else if (
          publicationTypes.includes(
            "Systematic Review"
          )
        ) {

          studyType =
            "📚 مراجعة منهجية";

        }

        else if (
          publicationTypes.includes(
            "Randomized Controlled Trial"
          )
        ) {

          studyType =
            "🩺 تجربة سريرية عشوائية";

        }

        else if (
          publicationTypes.includes(
            "Clinical Trial"
          )
        ) {

          studyType =
            "🩺 تجربة سريرية";

        }

        else if (
          publicationTypes.includes(
            "Review"
          )
        ) {

          studyType =
            "📖 مراجعة علمية";

        }



        html += `

          <div class="research-card">

            <h4>
              ${title}
            </h4>


            <p>
              <strong>
                نوع الدراسة:
              </strong>

              ${studyType}
            </p>


            <p>
              <strong>
                المجلة:
              </strong>

              ${journal}
            </p>


            <p>
              <strong>
                السنة:
              </strong>

              ${year}
            </p>


            <p>
              ${abstract.substring(0, 600)}

              ${
                abstract.length > 600
                  ? "..."
                  : ""
              }
            </p>


            <a
              href="https://pubmed.ncbi.nlm.nih.gov/${pmid}/"
              target="_blank"
              rel="noopener noreferrer"
            >
              قراءة الدراسة كاملة على PubMed →
            </a>

          </div>

        `;
      });



      container.innerHTML = html;


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
          ⚠️ تعذر تحميل الأبحاث العلمية
          حاليًا.
        </p>

        <p>
          يمكنك البحث مباشرة في PubMed
          لاحقًا.
        </p>

      `;
    }
  }

});
