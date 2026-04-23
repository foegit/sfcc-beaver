import { getSetting } from '../../helpers/settings';
import { IDocsSearchAdaptor } from './IDocsSearchAdaptor';
import { SfccLearningSearchAdaptor } from './SfccLearningSearchAdaptor';
import { SfccOfficialDeveloperAdaptor } from './SfccOficialDeveloperAdaptor';

export function getDocsAdaptor(): IDocsSearchAdaptor {
  if (getSetting('docs.provider') === 'b2cdevdoc') {
    return new SfccOfficialDeveloperAdaptor();
  }

  return new SfccLearningSearchAdaptor();
}

export function getDocsProviderLabel(provider?: string): string {
  const p = provider ?? getSetting('docs.provider');

  return p === 'b2cdevdoc' ? 'Official B2C Dev Docs' : 'SFCC Learning';
}
