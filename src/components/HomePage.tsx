import React from 'react';
import { FIFA_VERSIONS } from '../constants/versions';
import { localeNames, type Locale } from '../i18n';
import { useI18n } from '../i18n-context';

export const formatGameVersion = (version: string): string => {
  const versionNumber = Number(version);
  const displayVersion = Number.isInteger(versionNumber)
    ? String(versionNumber)
    : version;
  const prefix = versionNumber >= 24 ? 'EAFC' : 'FIFA';

  return `${prefix} ${displayVersion}`;
};

interface HomePageProps {
  draftName: string;
  version: string;
  numTeams: number;
  playersPerTeam: number;
  playersCount: number;
  onDraftNameChange: (draftName: string) => void;
  onVersionChange: (version: string) => void;
  onNumTeamsChange: (numTeams: number) => void;
  onPlayersPerTeamChange: (playersPerTeam: number) => void;
  onCreateDraft: () => void;
  onContinueLocalDraft: () => void;
  onLoadDraftFile: (file: File) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  draftName,
  version,
  numTeams,
  playersPerTeam,
  playersCount,
  onDraftNameChange,
  onVersionChange,
  onNumTeamsChange,
  onPlayersPerTeamChange,
  onCreateDraft,
  onContinueLocalDraft,
  onLoadDraftFile,
}) => {
  const { locale, setLocale, t } = useI18n();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreateDraft();
  };

  return (
    <main className="home-page">
      <label className="language-switcher">
        <span>{t('language')}</span>
        <select
          value={locale}
          onChange={(event) => setLocale(event.target.value as Locale)}
        >
          {Object.entries(localeNames).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <section className="home-hero">
        <div className="brand-mark">
          <img src={`${import.meta.env.BASE_URL}icon_novo.ico`} alt="" />
          <span>{t('brandRange')}</span>
        </div>

        <div className="hero-copy">
          <p className="hero-kicker">{t('homeKicker')}</p>
          <h1>{t('homeTitle')}</h1>
          <p className="hero-description">{t('homeDescription')}</p>
          <p className="hero-tip">{t('homeTip')}</p>
        </div>

        <div className="hero-stats" aria-label="Draft summary">
          <div>
            <strong>{playersCount || '...'}</strong>
            <span>{t('availablePlayers')}</span>
          </div>
          <div>
            <strong>{FIFA_VERSIONS.length}</strong>
            <span>{t('gameVersions')}</span>
          </div>
          <div>
            <strong>Snake</strong>
            <span>{t('alternatingOrder')}</span>
          </div>
        </div>
      </section>

      <aside className="draft-setup" aria-label={t('createDraftAria')}>
        <div className="setup-header">
          <span>{t('newDraft')}</span>
          <h2>{t('setupRoom')}</h2>
        </div>

        <form className="setup-form" onSubmit={handleSubmit}>
          <label>
            <span>{t('draftName')}</span>
            <input
              type="text"
              value={draftName}
              onChange={(event) => onDraftNameChange(event.target.value)}
              maxLength={36}
              placeholder={t('draftNamePlaceholder')}
            />
          </label>

          <label>
            <span>{t('gameVersion')}</span>
            <select
              value={version}
              onChange={(event) => onVersionChange(event.target.value)}
            >
              {FIFA_VERSIONS.map((availableVersion) => (
                <option key={availableVersion} value={availableVersion}>
                  {formatGameVersion(availableVersion)}
                </option>
              ))}
            </select>
          </label>

          <div className="setup-grid">
            <label>
              <span>{t('teams')}</span>
              <input
                type="number"
                min={2}
                max={32}
                value={numTeams}
                onChange={(event) => onNumTeamsChange(Number(event.target.value))}
              />
            </label>

            <label>
              <span>{t('playersPerTeam')}</span>
              <input
                type="number"
                min={3}
                max={26}
                value={playersPerTeam}
                onChange={(event) =>
                  onPlayersPerTeamChange(Number(event.target.value))
                }
              />
            </label>
          </div>

          <button className="create-draft-button" type="submit">
            {t('createDraft')}
          </button>

          <button
            className="load-draft-button"
            type="button"
            onClick={onContinueLocalDraft}
          >
            {t('continueLocalDraft')}
          </button>

          <button
            className="load-draft-button"
            type="button"
            onClick={() => document.getElementById('draft-file-input')?.click()}
          >
            {t('loadDraftFile')}
          </button>
          <input
            id="draft-file-input"
            type="file"
            accept="application/json,.json"
            className="hidden-file-input"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onLoadDraftFile(file);
              event.currentTarget.value = '';
            }}
          />
        </form>

        <div className="setup-note">
          <span>{t('totalPicks')}</span>
          <strong>{numTeams * playersPerTeam}</strong>
        </div>
      </aside>
    </main>
  );
};

export default HomePage;
