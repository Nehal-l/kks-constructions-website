import { getSiteContent, updateSiteContent } from "../backend/services/datastore.js";
import { pageContentDefaults } from "../data/content.js";

// Test in local datastore mode to verify data model, persistence, and visibility toggling
delete process.env.MONGODB_URI;

function isSectionVisible(content, id) {
  return content?.sectionVisibility?.[id] !== false;
}

function getPageCopy(content, page, section) {
  return {
    ...pageContentDefaults.pageCopy?.[page]?.[section],
    ...content?.pageCopy?.[page]?.[section],
  };
}

async function runTest() {
  console.log("=== Testing CMS Dynamic Editability & Persistence ===");

  // 1. Initial content fetch
  const initial = await getSiteContent(false);
  console.log("✓ Initial site content loaded successfully.");

  // 2. Perform a simulated update via CMS:
  // - Edit Private Advisory Desk title and phone
  // - Set section visibility
  const patch = {
    pageCopy: {
      contact: {
        privateDesk: {
          eyebrow: "EXCLUSIVE DESK",
          title: "Bespoke Private Advisory",
          phone: "+91 99999 88888",
          whatsapp: "+91 99999 88888",
          instagram: "@kks_exclusive",
          hours: "Mon - Sat 9am to 7pm",
          location: "Bespoke Suite, Hyderabad",
        },
      },
    },
    sectionVisibility: {
      "contact-private-desk": true,
      "services-cta": false,
    },
  };

  console.log("Saving & publishing test CMS patch...");
  await updateSiteContent(patch, true);

  // 3. Verify in getSiteContent(false) (what public visitors see)
  const publicContent = await getSiteContent(false);

  // Check pageCopy
  const privateDesk = getPageCopy(publicContent, "contact", "privateDesk");
  console.log("Retrieved updated Private Desk copy:", privateDesk);

  if (privateDesk.title !== "Bespoke Private Advisory") {
    throw new Error(`Expected title 'Bespoke Private Advisory', got: ${privateDesk.title}`);
  }
  if (privateDesk.phone !== "+91 99999 88888") {
    throw new Error(`Expected phone '+91 99999 88888', got: ${privateDesk.phone}`);
  }
  console.log("✓ Page copy verified successfully in public content.");

  // Check section visibility
  const isPrivateDeskVisible = isSectionVisible(publicContent, "contact-private-desk");
  const isServicesCtaVisible = isSectionVisible(publicContent, "services-cta");

  if (isPrivateDeskVisible !== true) {
    throw new Error(`Expected contact-private-desk to be visible (true), got: ${isPrivateDeskVisible}`);
  }
  if (isServicesCtaVisible !== false) {
    throw new Error(`Expected services-cta to be hidden (false), got: ${isServicesCtaVisible}`);
  }
  console.log("✓ Section visibility toggle (hide/show) verified successfully.");

  // 4. Test toggling off contact-private-desk completely
  console.log("Testing complete section removal/hide...");
  await updateSiteContent({
    sectionVisibility: {
      ...publicContent.sectionVisibility,
      "contact-private-desk": false,
    },
  }, true);

  const hiddenContent = await getSiteContent(false);
  if (isSectionVisible(hiddenContent, "contact-private-desk") !== false) {
    throw new Error("Expected contact-private-desk to be hidden after setting to false!");
  }
  console.log("✓ contact-private-desk successfully hidden on public page when owner disables it.");

  // 5. Restore clean state
  await updateSiteContent({
    pageCopy: {
      contact: {
        privateDesk: {
          eyebrow: "DIRECT CONTACT",
          title: "Private Advisory Desk",
          phone: "+91 98490 12345",
          whatsapp: "+91 98490 12345",
          instagram: "@kksconstructions",
          hours: "Monday–Saturday, 10:00 AM – 6:30 PM IST",
          location: "Hyderabad, Telangana — 500033",
          description: "For any enquiries, please contact us directly through phone, WhatsApp, or Instagram.",
          phoneLabel: "Phone",
          whatsappLabel: "WhatsApp",
          instagramLabel: "Instagram",
        },
      },
    },
    sectionVisibility: {
      ...publicContent.sectionVisibility,
      "contact-private-desk": true,
      "services-cta": true,
    },
  }, true);
  console.log("✓ Reset test state back to defaults.");

  console.log("\nALL CMS PERSISTENCE & EDITABILITY TESTS PASSED WITH 100% SUCCESS!");
}

runTest().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
