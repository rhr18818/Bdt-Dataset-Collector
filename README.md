# BDT-Collect

*A research dataset collection management system for the BDT-MultiScene Bangladeshi Taka banknote dataset*

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge&logo=netlify)](https://dataset-creation.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Built with React](https://img.shields.io/badge/Built_with-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Deployed on Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?style=for-the-badge&logo=netlify)](https://www.netlify.com/)
[![For Data in Brief](https://img.shields.io/badge/For-Data_in_Brief-FF6B00?style=for-the-badge)](https://www.journals.elsevier.com/data-in-brief)

*[Screenshot of dashboard view]*

## OVERVIEW

Coordinating multi-person dataset collection for a novel visually impaired-assistive banknote dataset presents significant logistical challenges that standard project management tools cannot resolve. Generic tools like spreadsheets or Notion lack the specialized capabilities required to enforce strict class balancing, track complex multi-object image combinations, and rigorously log inter-annotator agreement (IAA) metrics. For the BDT-MultiScene dataset, collectors needed real-time direction on specific missing denomination combinations, while researchers required systematic quality control logs to validate the dataset's integrity prior to academic publication. BDT-Collect was engineered from the ground up to solve these exact methodological bottlenecks seamlessly within the browser.

BDT-Collect operates through six integrated views that guide the entire lifecycle of dataset generation. The Dashboard provides a macro-level perspective with live trajectory charts, daily activity feeds, and progress breakdowns across all operational categories. The Collection Tasks interface dictates the daily workflow for contributors, dynamically migrating completed target combinations out of the active queue to ensure time is only spent capturing missing scenarios. As data flows in, the Annotation Queue tracks the pipeline status from unreviewed captures to finalized annotations, while the Team & Sessions view manages contributor credentials, external Drive storage links, and comprehensive activity logging. Simultaneously, the Quality Control module strictly monitors annotation precision, and the Export & Report interface automatically synthesizes all underlying data into formatted paper statistics and standardized CSV metadata packages.

The primary architectural motivation behind BDT-Collect is directly supporting the creation and peer-reviewed publication of BDT-MultiScene, targeting the Elsevier Data in Brief journal. BDT-MultiScene stands as the first dataset of its kind to feature multi-denomination scenes—capturing between two to six overlapping banknotes in single frames to accurately reflect authentic, real-world cash transactions. By providing dedicated interfaces to manage these structurally complex image combinations and mathematically measuring annotation quality, this software acts as the foundational infrastructure enabling the novel contributions of the [BDT-MultiScene Dataset]([Mendeley DOI]).

To maximize accessibility and deployment speed for non-technical research teams, the application embraces a deliberate design philosophy of extreme simplicity. It operates entirely as a zero-backend, single-page application utilizing React and local storage paradigms alongside Firebase configurations. Complex authentication protocols like Google OAuth were intentionally skipped in favor of simple URL reference tracking for Google Drive folders, matching the practical reality of how research teams share access dynamically. This architecture guarantees that the tool remains free to host, trivial to deploy, and infinitely reproducible for future dataset projects.

## FEATURES

| View | Key Features | Research Purpose |
| :--- | :--- | :--- |
| **Dashboard** | Live progress charts, daily activity feed, category progress with sub-breakdowns, days-to-deadline counter. | Provides principal investigators with a real-time, high-level overview of dataset completion status against target milestones. |
| **Collection Tasks** | Dynamic multi-note combination matrix (2–6 notes), To-Do/Completed auto-migration, occlusion tracking, 7×5 environment/lighting matrix color-coded for completion. | Ensures dataset diversity by directing collectors to capture explicitly required, mathematically balanced real-world scenarios rather than redundant single-note images. |
| **Annotation Queue** | Pipeline status tracking (Collected → Annotated → Reviewed → Approved), filterable logs, per-annotator workflow statistics. | Maintains strict provenance and state management for every image asset progressing through the dataset construction pipeline. |
| **Quality Control** | Inter-annotator agreement (IAA) tracking, random 10-image batch check logging, per-annotator accuracy charts, automatic consecutive-failure warning banners. | Generates the foundational IAA metric data strictly required to prove dataset reliability for Data in Brief journal submissions. |
| **Team & Sessions** | Team member management, raw URL Google Drive folder storage (no OAuth), task assignment tables, full session activity logs. | Eliminates platform friction for collectors while providing a transparent, auditable trail of who collected what data and when. |
| **Export & Report** | Auto-generated paper statistics paragraph, CSV exports for session logs, metadata, and QC reports, dataset summary figures. | Directly outputs publication-ready text and supplementary data files formatted explicitly for inclusion in academic dataset papers. |

## QUICK START

**Option A — Just use the live app (no setup required):**
Visit the live production build immediately at: https://dataset-creation.netlify.app/

**Option B — Run locally (Standard React Development):**
To run the software on your local machine for active development or isolated use:
1. `git clone https://github.com/[Organization]/BDT-Collect.git`
2. `cd BDT-Collect`
3. `npm install`
4. `npm run dev`

**Option C — Fork and deploy your own Netlify instance:**
To host your own version of this workflow tool for your team:
1. Fork this repository to your own GitHub account.
2. Log into Netlify and create a new site by connecting to your forked GitHub repository.
3. Set the build command to `npm run build` and the publish directory to `dist`.
4. Click Deploy. The free tier is entirely sufficient for standard research team usage.

## ADAPTING FOR YOUR OWN DATASET PROJECT

If you are a researcher looking to adapt this tool for your own custom dataset (e.g., a different currency, or entirely different object taxonomy), you can modify the application directly.

### 5.1 Changing the denomination classes
To swap the Bangladeshi Taka denominations out for another currency like the Indian Rupee or the Euro, you must update the core class definitions. Open `src/data/seedData.js` (or your equivalent constants file) and locate the `CLASSES` array. Simply replace the numeric strings ("2", "5", "10", etc.) with your target object classes. These strings populate dropdowns and charts throughout the entire application automatically.

### 5.2 Changing the combination targets
The specific multi-object arrangements dictating what your collectors should photograph live in the Category B seed data structure. Navigate to the section defining `combinationTargets` in your initial state configuration. You can delete the existing 2-note to 6-note arrays and replace them with specific object hierarchies relevant to your research. For example, replacing currency combinations with specific overlapping medical instrument scenarios.

### 5.3 Changing category names and targets
The overarching categories (currently Single, Multi-note, Occlusion, and Lighting) and their respective image volume targets represent standard Data in Brief specifications table fields. You can redefine these inside the `targets` object in your local state configuration. Altering the `target` integer values here will automatically recalibrate all progress bars, completion thresholds, and auto-migration calculations across the Dashboard and Collection Tasks views.

### 5.4 Resetting for a new project
When you have finished adjusting your schemas and want to wipe out the BDT-Collect test data, simply open the app, navigate to Settings (the cog icon in the navigation bar), select "Reset All Data", and type `RESET` to confirm. All underlying local storage is immediately cleared, and your new customized seed data will instantiate fresh.

## DATA SCHEMA

```json
{
  "meta": {
    "version": "1.0",
    "lastUpdated": "2026-04-11T12:00:00Z"
  },
  "team": [
    {
      "id": "u1",
      "name": "Collector Name",
      "role": "annotator",
      "driveLink": "https://drive.google.com/..."
    }
  ],
  "sessions": [
    {
      "sessionId": "s123",
      "userId": "u1",
      "timestamp": "2026-04-11T10:00:00Z",
      "category": "A",
      "imagesCollected": 50,
      "notes": "Good lighting conditions"
    }
  ],
  "qcChecks": [
    {
      "checkId": "qc456",
      "batchId": "b89",
      "reviewerId": "u2",
      "annotatorId": "u1",
      "imagesChecked": 10,
      "errorsFound": 1,
      "errorTypes": ["bounding_box_loose"],
      "agreementScore": 90.0
    }
  ],
  "taskAssignments": [],
  "targets": {
    "categoryA": 10000,
    "categoryB": 10000,
    "categoryC": 4000,
    "categoryD": 4000
  }
}
```

The `sessions` array acts as the definitive single source of truth for the entire application—all dashboard progress numbers, remaining targets, and collector statistics are derived dynamically from this array. Nothing is stored redundantly. The schema itself was explicitly structured to be exportable as a flat CSV, ensuring it can immediately serve as the `metadata.csv` file mandated in open-access dataset repositories. Quality control checks (`qcChecks`) are isolated efficiently so they can generate a standalone QC report required by rigorous journal reviewers without polluting the core session data.

## For Researchers — Citing BDT-Collect

### 7.1 Why we built and published this tool
High-quality, peer-reviewed machine learning datasets demand rigorous, transparent validation methodologies, yet the actual infrastructure used tracking annotation quality is rarely published. Making BDT-Collect fully public allows other computer vision research teams to deploy our tested quality control methodology directly. By utilizing and citing the same infrastructural tool, inter-annotator agreement scores become easily comparable across different dataset publications, fostering better reproducibility across the broader research community.

### 7.2 How this tool is cited in the associated paper
In the Methods sections of our Data in Brief submission for BDT-MultiScene, this tool is formally documented as:
*"[Author Name, et al.]. BDT-Collect: A web-based dataset collection management system for the BDT-MultiScene banknote dataset. GitHub, 2026. doi: [Zenodo DOI]"*

### 7.3 Citation format

**APA:**
[Author Name, et al.]. (2026). BDT-Collect: A web-based dataset collection management system [Software]. Zenodo. https://doi.org/[Zenodo DOI]

**BibTeX:**
```bibtex
@software{bdtcollect2026,
  author    = {[Author Name, et al.]},
  title     = {BDT-Collect: A web-based dataset collection management system},
  year      = {2026},
  publisher = {Zenodo},
  doi       = {[Zenodo DOI]},
  url       = {https://doi.org/[Zenodo DOI]}
}
```

**IEEE:**
[N] [Author Name, et al.], "BDT-Collect: A web-based dataset collection management system," Zenodo, 2026, doi: [Zenodo DOI].

### 7.4 Related publications

| Publication | Venue | Role of this tool | Link |
| :--- | :--- | :--- | :--- |
| BDT-MultiScene dataset paper | Data in Brief, Elsevier | QC data source | [Mendeley DOI] |
| BDT-Assist system paper | IEEE Conference | Dataset infrastructure | [IEEE DOI] |

## INTER-ANNOTATOR AGREEMENT — HOW IT WORKS

To guarantee dataset integrity for machine learning applications, BDT-Collect strictly enforces an Inter-Annotator Agreement (IAA) methodology designed transparently for peer review. The quality control review cycle triggers automatically as data pipelines advance; for every 200 images an annotator finalizes, a designated senior reviewer is tasked with exhaustively checking a randomized subset of 10 images. They log their findings directly into the tool's interface, calculating an agreement score defined simply as the batch size minus the identified errors, divided by the total batch size, returning a percentage metric. 

When errors are identified during these spot checks, the tool tracks exactly what type of mistake occurred, categorizing them systematically into failures such as wrong class labels, overly loose bounding boxes, missing annotations entirely, wrong denomination assignments, or failures to separate heavily occluded overlapping boxes. The system is rigidly baselined against a target IAA threshold of ≥95%, ensuring the final dataset meets elite operational standards ([cite threshold justification]). Furthermore, if any individual annotator's performance drops below 90% across three consecutive checks, the system broadcasts a prominent automated warning banner to the project leads indicating retraining intervention is required. All of these logs are independently stored and exported as a comprehensive CSV, explicitly intended to serve as undeniable supplementary proof of dataset reliability for demanding journal reviewers.

## PROJECT STATUS & ROADMAP

| Feature | Status |
| :--- | :--- |
| Dashboard with live progress charts | ✅ |
| Collection task logging (all 4 categories) | ✅ |
| Multi-note combinations (2–6 notes) | ✅ |
| To-Do / Completed auto-split for combinations | ✅ |
| Quality control module with IAA tracking | ✅ |
| Team management and session logging | ✅ |
| Google Drive folder link integration | ✅ |
| Export: session CSV, metadata CSV, QC report | ✅ |
| Auto-generated paper statistics paragraph | ✅ |
| Roboflow annotation queue direct integration | 🔄 |
| Multi-language support (Bangla UI) | 📋 |
| Image upload preview | 📋 |
| Offline PWA support | 📋 |

## CONTRIBUTING

Because BDT-Collect serves as both open-source software and open research infrastructure, contributions are warmly welcomed. We are highly enthusiastic about seeing other dataset research projects adapt these systems for their distinct methodologies. Pull requests addressing bug fixes, UI/UX refinement, or new workflow integrations are inherently valuable. If you adapt this infrastructure for your own academic dataset publication, please open an issue or reach out directly—we are actively compiling a list of diverse research datasets that leverage this tool for mutual citation visibility.

## LICENSE

This software is released under the MIT License. Anyone is free to use, completely modify, and distribute this application commercially or academically, provided proper attribution is maintained.

## ACKNOWLEDGEMENTS

* The visually impaired community in Bangladesh who motivated the BDT-Assist project
* The junior researchers who are conducting the rigorous data collection
* Built prominently with React, Tailwind CSS, Recharts, and Lucide React
