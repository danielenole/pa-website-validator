"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";

const Audit = lighthouse.Audit;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: "municipality-informative-cloud-infrastructure",
      title:
        "R.SI.2.1 - INFRASTRUTTURE CLOUD - Il sito comunale deve essere ospitato su infrastrutture qualificate ai sensi della normativa vigente.",
      failureTitle:
        "R.SI.2.1 - INFRASTRUTTURE CLOUD - Il sito comunale deve essere ospitato su infrastrutture qualificate ai sensi della normativa vigente.",
      scoreDisplayMode: Audit.SCORING_MODES.INFORMATIVE,
      description:
        "RIFERIMENTI TECNICI E NORMATIVI: per consentire un'erogazione più sicura, efficiente e scalabile del sito comunale, può essere utile considerare di impostare l'infrastruttura che lo ospita in cloud, secondo quanto descritto nella Strategia Cloud Italia. Hosting e re-hosting non sono finanziabili ai sensi del presente avviso, tuttavia tali costi di infrastruttura possono essere coperti dalla misura 1.2 Abilitazione e facilitazione migrazione al Cloud per i comuni, attraverso la scelta del servizio per l'amministrazione \"Comunicazione istituzionale web e open data\" [Strategia Cloud Italia](https://cloud.italia.it/strategia-cloud-pa/)",
      requiredArtifacts: [],
    };
  }

  static async audit(): Promise<{ score: number }> {
    return {
      score: 1,
    };
  }
}

module.exports = LoadAudit;