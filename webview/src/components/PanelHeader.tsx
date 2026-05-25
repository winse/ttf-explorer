import { Icon, Tag } from '@blueprintjs/core';
import type { IconName } from '@blueprintjs/icons';
import React from 'react';

export interface PanelHeaderProps {
  icon: IconName;
  title: string;
  badge?: string | number;
  extra?: React.ReactNode;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({ icon, title, badge, extra }) => (
  <div className="fe-panel-header">
    <div className="fe-panel-header-left">
      <Icon icon={icon} size={14} className="fe-panel-header-icon" />
      <span className="fe-panel-header-title">{title}</span>
      {badge !== undefined && <Tag minimal round className="fe-panel-header-badge">{badge}</Tag>}
    </div>
    {extra && <div className="fe-panel-header-extra">{extra}</div>}
  </div>
);
