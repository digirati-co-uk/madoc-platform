import * as React from 'react';
import styled from 'styled-components';
import { Heading1 } from '../../src/frontend/shared/typography/Heading1';
import { UserPermissions } from '../../src/frontend/shared/components/UserPermissions';
import { Heading3, Subheading3 } from '../../src/frontend/shared/typography/Heading3';
import { ProjectListing } from '../../src/frontend/shared/atoms/ProjectListing';
import {
  Statistic,
  StatisticContainer,
  StatisticLabel,
  StatisticNumber,
} from '../../src/frontend/shared/atoms/Statistics';
import { TinyButton } from '../../src/frontend/shared/navigation/Button';
import { TableContainer, TableRow, TableRowLabel } from '../../src/frontend/shared/layout/Table';
import { Status } from '../../src/frontend/shared/atoms/Status';
import { GridContainer, HalfGird } from '../../src/frontend/shared/layout/Grid';

const StorybookPaddedBox = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1em;
`;

export default { title: 'Legacy/User homepage' };

const projects = [
  {
    id: 1234,
    label: { en: ['Some interesting project'] },
    summary: { en: ['Example summary'] },
    capture_model_id: '1231231231231',
    collection_id: 123,
    task_id: '1231231231',
    slug: '123',
  },
];

export const NormalUser: React.FC = () => {
  return (
    <>
      <StorybookPaddedBox>
        <Heading1 $margin>Welcome back Stephen</Heading1>
        <div>
          <TinyButton>Manage account</TinyButton>
        </div>
        <div>
          <StatisticContainer>
            <Statistic>
              <StatisticNumber>{12}</StatisticNumber>
              <StatisticLabel>Bookmarks</StatisticLabel>
            </Statistic>
            <Statistic>
              <StatisticNumber>{0}</StatisticNumber>
              <StatisticLabel>Accepted contributions</StatisticLabel>
            </Statistic>
            <Statistic>
              <StatisticNumber>{0}</StatisticNumber>
              <StatisticLabel>Total contributions</StatisticLabel>
            </Statistic>
          </StatisticContainer>
        </div>
        <Heading3 $margin>Active projects</Heading3>
        <ProjectListing projects={projects} label="View project" />
      </StorybookPaddedBox>
    </>
  );
};

export const Contributor: React.FC = () => {
  return (
    <>
      <StorybookPaddedBox>
        <Heading1 $margin>Welcome back Stephen</Heading1>
        <div>
          <TinyButton>Manage account</TinyButton>
        </div>
        <div>
          <StatisticContainer>
            <Statistic>
              <StatisticNumber>{12}</StatisticNumber>
              <StatisticLabel>Bookmarks</StatisticLabel>
            </Statistic>
            <Statistic>
              <StatisticNumber>{36}</StatisticNumber>
              <StatisticLabel>Accepted contributions</StatisticLabel>
            </Statistic>
            <Statistic>
              <StatisticNumber>{98}</StatisticNumber>
              <StatisticLabel>Total contributions</StatisticLabel>
            </Statistic>
          </StatisticContainer>
        </div>

        <Heading3>Your contributions</Heading3>
        <GridContainer>
          <HalfGird $margin>
            <Subheading3>Contributions in progress</Subheading3>
            <TableContainer>
              <TableRow>
                <TableRowLabel>
                  <Status status={1} text="Accepted" />
                </TableRowLabel>
                <TableRowLabel>
                  <a href="#">Contribution to something something</a>
                </TableRowLabel>
              </TableRow>
              <TableRow>
                <TableRowLabel>
                  <Status status={1} text="In progress" />
                </TableRowLabel>
                <TableRowLabel>
                  <a href="#">Contribution to something something</a>
                </TableRowLabel>
              </TableRow>
              <TableRow>
                <TableRowLabel>
                  <Status status={1} text="In progress" />
                </TableRowLabel>
                <TableRowLabel>
                  <a href="#">Contribution to something something</a>
                </TableRowLabel>
              </TableRow>
            </TableContainer>
          </HalfGird>
          <HalfGird $margin>
            <Subheading3>Contributions in review</Subheading3>
            <TableContainer>
              <TableRow>
                <TableRowLabel>
                  <Status status={5} text="In review" />
                </TableRowLabel>
                <TableRowLabel>
                  <a href="#">Contribution to something something</a>
                </TableRowLabel>
              </TableRow>
              <TableRow>
                <TableRowLabel>
                  <Status status={5} text="In review" />
                </TableRowLabel>
                <TableRowLabel>
                  <a href="#">Contribution to something something</a>
                </TableRowLabel>
              </TableRow>
            </TableContainer>
          </HalfGird>
        </GridContainer>
        <TinyButton>Browse all contributions</TinyButton>

        <Heading3 $margin>Active projects</Heading3>
        <ProjectListing projects={projects} label="View project" onContribute={() => void 0} />
      </StorybookPaddedBox>
    </>
  );
};

export const Reviewer: React.FC = () => {
  return (
    <>
      <StorybookPaddedBox>
        <Heading1 $margin>Welcome back Stephen</Heading1>
        <div>
          <TinyButton>Manage account</TinyButton>
        </div>
        <div>
          <StatisticContainer>
            <Statistic>
              <StatisticNumber>{12}</StatisticNumber>
              <StatisticLabel>Bookmarks</StatisticLabel>
            </Statistic>
            <Statistic>
              <StatisticNumber>{492}</StatisticNumber>
              <StatisticLabel>Reviewed contributions</StatisticLabel>
            </Statistic>
            <Statistic>
              <StatisticNumber>{36}</StatisticNumber>
              <StatisticLabel>Accepted contributions</StatisticLabel>
            </Statistic>
            <Statistic>
              <StatisticNumber>{98}</StatisticNumber>
              <StatisticLabel>Total contributions</StatisticLabel>
            </Statistic>
          </StatisticContainer>
        </div>

        <Heading3>Reviews</Heading3>
        <TableContainer>
          <TableRow>
            <TableRowLabel>
              <Status status={1} text="Accepted" />
            </TableRowLabel>
            <TableRowLabel>
              <a href="#">Contribution to something something</a>
            </TableRowLabel>
          </TableRow>
          <TableRow>
            <TableRowLabel>
              <Status status={1} text="In progress" />
            </TableRowLabel>
            <TableRowLabel>
              <a href="#">Contribution to something something</a>
            </TableRowLabel>
          </TableRow>
          <TableRow>
            <TableRowLabel>
              <Status status={1} text="In progress" />
            </TableRowLabel>
            <TableRowLabel>
              <a href="#">Contribution to something something</a>
            </TableRowLabel>
          </TableRow>
        </TableContainer>
        <TinyButton>Browse all reviews</TinyButton>

        <Heading3>Your contributions</Heading3>
        <GridContainer>
          <HalfGird $margin>
            <Subheading3>Contributions in progress</Subheading3>
            <TableContainer>
              <TableRow>
                <TableRowLabel>
                  <Status status={1} text="Accepted" />
                </TableRowLabel>
                <TableRowLabel>
                  <a href="#">Contribution to something something</a>
                </TableRowLabel>
              </TableRow>
              <TableRow>
                <TableRowLabel>
                  <Status status={1} text="In progress" />
                </TableRowLabel>
                <TableRowLabel>
                  <a href="#">Contribution to something something</a>
                </TableRowLabel>
              </TableRow>
              <TableRow>
                <TableRowLabel>
                  <Status status={1} text="In progress" />
                </TableRowLabel>
                <TableRowLabel>
                  <a href="#">Contribution to something something</a>
                </TableRowLabel>
              </TableRow>
            </TableContainer>
          </HalfGird>
          <HalfGird $margin>
            <Subheading3>Contributions in review</Subheading3>
            <TableContainer>
              <TableRow>
                <TableRowLabel>
                  <Status status={5} text="In review" />
                </TableRowLabel>
                <TableRowLabel>
                  <a href="#">Contribution to something something</a>
                </TableRowLabel>
              </TableRow>
              <TableRow>
                <TableRowLabel>
                  <Status status={5} text="In review" />
                </TableRowLabel>
                <TableRowLabel>
                  <a href="#">Contribution to something something</a>
                </TableRowLabel>
              </TableRow>
            </TableContainer>
          </HalfGird>
        </GridContainer>
        <TinyButton>Browse all contributions</TinyButton>

        <Heading3 $margin>Active projects</Heading3>
        <ProjectListing projects={projects} label="View project" onContribute={() => void 0} />
      </StorybookPaddedBox>
    </>
  );
};

export const PermissionList: React.FC = () => {
  return (
    <StorybookPaddedBox>
      <Heading1 $margin>Permissions overview</Heading1>
      <UserPermissions
        permissions={[
          { label: 'Browse IIIF content on the this site', value: true },
          { label: 'Make crowd sourcing contributions', value: false },
        ]}
      />
    </StorybookPaddedBox>
  );
};
