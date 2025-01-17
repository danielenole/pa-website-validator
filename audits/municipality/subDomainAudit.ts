"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lighthouse from "lighthouse";
import { auditDictionary } from "../../storage/auditDictionary";
import { CheerioAPI } from "cheerio";
import { buildUrl, isInternalUrl, loadPageData } from "../../utils/utils";
import { domains } from "../../storage/municipality/allowedDomains";

const Audit = lighthouse.Audit;

const auditId = "municipality-subdomain";
const auditData = auditDictionary[auditId];

const greenResult = auditData.greenResult;
const yellowResult = auditData.yellowResult;
const redResult = auditData.redResult;
const notExecuted = auditData.nonExecuted;

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: auditId,
      title: auditData.title,
      failureTitle: auditData.failureTitle,
      description: auditData.description,
      scoreDisplayMode: Audit.SCORING_MODES.BINARY,
      requiredArtifacts: ["origin"],
    };
  }

  static async audit(
    artifacts: LH.Artifacts & { origin: string }
  ): Promise<{ score: number; details: LH.Audit.Details.Table }> {
    const url = artifacts.origin;
    const headings = [
      {
        key: "result",
        itemType: "text",
        text: "Risultato",
      },
      {
        key: "domain",
        itemType: "text",
        text: "Dominio utilizzato",
      },
      {
        key: "subdomain",
        itemType: "text",
        text: "Sottodominio utilizzato",
      },
    ];
    const items = [
      {
        result: redResult,
        domain: "",
        subdomain: "",
      },
    ];

    const $: CheerioAPI = await loadPageData(url);
    const loginAreaElement = $('[data-element="personal-area-login"]');
    const elementObj = $(loginAreaElement).attr();

    if (
      !elementObj ||
      !("href" in elementObj) ||
      elementObj.href === "#" ||
      elementObj.href === ""
    ) {
      items[0].result = notExecuted;

      return {
        score: 0,
        details: Audit.makeTableDetails(headings, items),
      };
    }

    if (
      !elementObj.href.includes(url) &&
      (await isInternalUrl(elementObj.href))
    ) {
      elementObj.href = await buildUrl(url, elementObj.href);
    }

    const serviceAreaPathName = new URL(elementObj.href).pathname;
    const serviceAreaHostname = new URL(elementObj.href).hostname.replace(
      "www.",
      ""
    );
    const originHostname = new URL(url).hostname.replace("www.", "");

    let serviceAreaHostnameParts = serviceAreaHostname.split(".").reverse();
    const originHostnameParts = originHostname.split(".").reverse();

    let sameDomain = true;
    let sameDomainChunkCount = 0;
    while (sameDomain && sameDomainChunkCount < originHostnameParts.length) {
      if (
        serviceAreaHostnameParts[sameDomainChunkCount] !==
        originHostnameParts[sameDomainChunkCount]
      ) {
        sameDomain = false;
      }
      sameDomainChunkCount++;
    }

    let correctDomain = false;
    for (const domain of domains) {
      if (serviceAreaHostname.includes("comune." + domain)) {
        correctDomain = true;
      }
    }

    let isServiziSubdomain = false;
    let isServiziPath = false;
    if (correctDomain && serviceAreaHostname.includes("servizi.comune.")) {
      isServiziSubdomain = true;
    } else if (serviceAreaPathName.includes("/servizi")) {
      isServiziPath = true;
    }

    serviceAreaHostnameParts = serviceAreaHostnameParts.reverse();
    items[0].domain = serviceAreaHostnameParts
      .slice(
        serviceAreaHostnameParts.length - sameDomainChunkCount,
        serviceAreaHostnameParts.length
      )
      .join(".");
    items[0].subdomain = serviceAreaHostnameParts
      .slice(0, serviceAreaHostnameParts.length - sameDomainChunkCount)
      .join(".");

    let score = 0;
    if (correctDomain && sameDomain && isServiziSubdomain) {
      score = 1;
      items[0].result = greenResult;
    } else if (
      (correctDomain && sameDomain && isServiziPath) ||
      originHostnameParts.length === serviceAreaHostnameParts.length
    ) {
      score = 0.5;
      items[0].result = yellowResult;
    }

    return {
      score: score,
      details: Audit.makeTableDetails(headings, items),
    };
  }
}

module.exports = LoadAudit;
