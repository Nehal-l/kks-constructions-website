import { pageContentDefaults } from "@data";

export function isSectionVisible(content, id) {
  return content?.sectionVisibility?.[id] !== false;
}

export function getPageCopy(content, page, section) {
  return {
    ...pageContentDefaults.pageCopy?.[page]?.[section],
    ...content?.pageCopy?.[page]?.[section],
  };
}
