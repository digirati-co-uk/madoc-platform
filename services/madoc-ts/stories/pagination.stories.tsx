// Canonical pagination.

import { useState } from 'react';
import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import * as MoleculesPagination from '../src/frontend/admin/molecules/Pagination';
import { NavigationButton, PaginationContainer } from '../src/frontend/shared/components/CanvasNavigationMinimalist';
import { PaginationNumbered } from '../src/frontend/shared/components/Pagination';
import * as SharedPagination from '../src/frontend/shared/components/Pagination';
import styled, { css } from 'styled-components';
import { Spinner } from '../src/frontend/shared/icons/Spinner';

export default { title: 'Pagination variations' };

export const Molecules_Pagination = () => {
  return (
    <MemoryRouter>
      <MoleculesPagination.Pagination page={2} totalPages={10} stale={false} />
    </MemoryRouter>
  );
};

export const Shared_Pagination = () => {
  return (
    <MemoryRouter>
      <SharedPagination.Pagination page={2} totalPages={10} stale={false} />
    </MemoryRouter>
  );
};

export const Numbered_Pagination = () => {
  return (
    <MemoryRouter>
      <PaginationNumbered page={2} totalPages={10} stale={false} />
    </MemoryRouter>
  );
};

export const Canvas_Navigation = () => {
  const idx = 2;
  const totalPages = 10;

  return (
    <MemoryRouter>
      <PaginationContainer style={{ display: 'flex' }}>
        {idx > 0 ? <NavigationButton alignment="left" link="#" item={true as any} /> : null}
        {<p>{`${idx + 1} of ${idx + 1}`}</p>}
        {idx < totalPages ? <NavigationButton alignment="right" link="#" item={true as any} /> : null}
      </PaginationContainer>
    </MemoryRouter>
  );
};

const PagerContainer = styled.div`
  padding: 0.2em 0.5em;
  display: flex;
  justify-content: flex-end;
`;

const PagerButton = styled.div<{ $active?: boolean; $disabled?: boolean; $loading?: boolean }>`
  padding: 0.2em 0.5em;
  //color: #abb3d2;
  color: #333;
  margin: 0 0.2em;
  border-radius: 3px;
  font-size: 0.9em;
  cursor: pointer;
  user-select: none;
  position: relative;

  &:hover {
    background: #dce1ec;
    //color: #7b85a6;
    color: #333;
  }

  ${props =>
    props.$active &&
    css`
      background: #3579f6;
      color: #fff;
      cursor: initial;
      &:hover {
        background: #3579f6;
        color: #fff;
      }
    `}

  ${props =>
    props.$disabled &&
    css`
      color: #acb2ce;
      pointer-events: none;
      cursor: not-allowed;
    `}
  ${props =>
    props.$loading &&
    css`
      color: rgba(255, 255, 255, 0.5);
    `}
`;

const PagerButtonSelect = styled.select`
  padding: 0.2em 0.5em;
  color: #333;
  margin: 0 0.2em;
  border-radius: 3px;
  font-size: 0.9em;
  cursor: pointer;
  appearance: none;
  border: none;
  outline: none;
  text-align: center;

  &:hover {
    background: #dce1ec;
    color: #333;
  }
`;

export const NewPagination = () => {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ width: 800, background: '#000', padding: 30, textAlign: 'right' }}>
      <div style={{ background: '#fff', padding: 30, marginBottom: 10 }}>
        <PagerContainer>
          <PagerButton $disabled>Prev</PagerButton>
          <PagerButton $active>1</PagerButton>
          <PagerButton>2</PagerButton>
          <PagerButton>3</PagerButton>
          <PagerButton>Next</PagerButton>
        </PagerContainer>
      </div>
      <div style={{ background: '#fff', padding: 30, marginBottom: 10 }}>
        <PagerContainer>
          <PagerButton>Prev</PagerButton>
          <PagerButton>1</PagerButton>
          <PagerButton>2</PagerButton>
          <PagerButton>3</PagerButton>
          <PagerButton>4</PagerButton>
          <PagerButton $active>5</PagerButton>
          <PagerButton>6</PagerButton>
          <PagerButton>7</PagerButton>
          <PagerButton>Next</PagerButton>
        </PagerContainer>
      </div>
      <div style={{ background: '#fff', padding: 30, marginBottom: 10 }}>
        <PagerContainer>
          <PagerButton>Prev</PagerButton>
          <PagerButton>1</PagerButton>
          <PagerButton>2</PagerButton>
          <PagerButton>3</PagerButton>
          <PagerButton>4</PagerButton>
          <PagerButton $active $loading={loading} onClick={() => setLoading(l => !l)}>
            {loading ? (
              <Spinner
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'scale(1.2)',
                  marginLeft: 'calc(-50% + 0.3em)',
                  marginTop: 'calc(-50% + 0.3em)',
                }}
              />
            ) : null}
            5
          </PagerButton>
          <PagerButton>6</PagerButton>
          <PagerButton>7</PagerButton>
          <PagerButton>Next</PagerButton>
        </PagerContainer>
      </div>
      <div style={{ background: '#fff', padding: 30, marginBottom: 10 }}>
        <PagerContainer>
          <PagerButton>Prev</PagerButton>
          <PagerButton $active>1</PagerButton>
          <PagerButton>2</PagerButton>
          <PagerButton>3</PagerButton>
          <PagerButton>4</PagerButton>
          <PagerButton>5</PagerButton>
          <PagerButton>6</PagerButton>
          <PagerButtonSelect>
            <option>...</option>
            <option>7</option>
            <option>8</option>
            <option>9</option>
          </PagerButtonSelect>
          <PagerButton>10</PagerButton>
          <PagerButton>Next</PagerButton>
        </PagerContainer>
      </div>
      <div style={{ background: '#fff', padding: 30, marginBottom: 10 }}>
        <PagerContainer>
          <PagerButton>Prev</PagerButton>
          <PagerButton>1</PagerButton>
          <PagerButton $active>2</PagerButton>
          <PagerButton>3</PagerButton>
          <PagerButton>4</PagerButton>
          <PagerButton>5</PagerButton>
          <PagerButton>6</PagerButton>
          <PagerButtonSelect>
            <option>...</option>
            <option>7</option>
            <option>8</option>
            <option>9</option>
          </PagerButtonSelect>
          <PagerButton>10</PagerButton>
          <PagerButton>Next</PagerButton>
        </PagerContainer>
      </div>
      <div style={{ background: '#fff', padding: 30, marginBottom: 10 }}>
        <PagerContainer>
          <PagerButton>Prev</PagerButton>
          <PagerButton>1</PagerButton>
          <PagerButton>2</PagerButton>
          <PagerButton $active>3</PagerButton>
          <PagerButton>4</PagerButton>
          <PagerButton>5</PagerButton>
          <PagerButton>6</PagerButton>
          <PagerButtonSelect>
            <option>...</option>
            <option>7</option>
            <option>8</option>
            <option>9</option>
          </PagerButtonSelect>
          <PagerButton>10</PagerButton>
          <PagerButton>Next</PagerButton>
        </PagerContainer>
      </div>
      <div style={{ background: '#fff', padding: 30, marginBottom: 10 }}>
        <PagerContainer>
          <PagerButton>Prev</PagerButton>
          <PagerButton>1</PagerButton>
          <PagerButton>2</PagerButton>
          <PagerButton>3</PagerButton>
          <PagerButton $active>4</PagerButton>
          <PagerButton>5</PagerButton>
          <PagerButton>6</PagerButton>
          <PagerButtonSelect>
            <option>...</option>
            <option>7</option>
            <option>8</option>
            <option>9</option>
          </PagerButtonSelect>
          <PagerButton>10</PagerButton>
          <PagerButton>Next</PagerButton>
        </PagerContainer>
      </div>
      <div style={{ background: '#fff', padding: 30, marginBottom: 10 }}>
        <PagerContainer>
          <PagerButton>Prev</PagerButton>
          <PagerButton>1</PagerButton>
          <PagerButton>2</PagerButton>
          <PagerButton>3</PagerButton>
          <PagerButton>4</PagerButton>
          <PagerButton $active>5</PagerButton>
          <PagerButton>6</PagerButton>
          <PagerButtonSelect>
            <option>...</option>
            <option>7</option>
            <option>8</option>
            <option>9</option>
          </PagerButtonSelect>
          <PagerButton>10</PagerButton>
          <PagerButton>Next</PagerButton>
        </PagerContainer>
      </div>
      <div style={{ background: '#fff', padding: 30, marginBottom: 10 }}>
        <PagerContainer>
          <PagerButton>Prev</PagerButton>
          <PagerButton>1</PagerButton>
          <PagerButtonSelect>
            <option>...</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
          </PagerButtonSelect>
          <PagerButton>5</PagerButton>
          <PagerButton $active>6</PagerButton>
          <PagerButton>7</PagerButton>
          <PagerButton>8</PagerButton>
          <PagerButton>9</PagerButton>
          <PagerButton>10</PagerButton>
          <PagerButton>Next</PagerButton>
        </PagerContainer>
      </div>
      <div style={{ background: '#fff', padding: 30, marginBottom: 10 }}>
        <PagerContainer>
          <PagerButton>Prev</PagerButton>
          <PagerButton>1</PagerButton>
          <PagerButtonSelect>
            <option>...</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
          </PagerButtonSelect>
          <PagerButton>5</PagerButton>
          <PagerButton>6</PagerButton>
          <PagerButton $active>7</PagerButton>
          <PagerButton>8</PagerButton>
          <PagerButton>9</PagerButton>
          <PagerButton>10</PagerButton>
          <PagerButton>Next</PagerButton>
        </PagerContainer>
      </div>
      <div style={{ background: '#fff', padding: 30, marginBottom: 10 }}>
        <PagerContainer>
          <PagerButton>Prev</PagerButton>
          <PagerButton>1</PagerButton>
          <PagerButtonSelect>
            <option>...</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
          </PagerButtonSelect>
          <PagerButton>5</PagerButton>
          <PagerButton>6</PagerButton>
          <PagerButton>7</PagerButton>
          <PagerButton $active>8</PagerButton>
          <PagerButton>9</PagerButton>
          <PagerButton>10</PagerButton>
          <PagerButton>Next</PagerButton>
        </PagerContainer>
      </div>
      <div style={{ background: '#fff', padding: 30, marginBottom: 10 }}>
        <PagerContainer>
          <PagerButton>Prev</PagerButton>
          <PagerButton>1</PagerButton>
          <PagerButtonSelect>
            <option>...</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
          </PagerButtonSelect>
          <PagerButton>5</PagerButton>
          <PagerButton>6</PagerButton>
          <PagerButton>7</PagerButton>
          <PagerButton>8</PagerButton>
          <PagerButton $active>9</PagerButton>
          <PagerButton>10</PagerButton>
          <PagerButton>Next</PagerButton>
        </PagerContainer>
      </div>
      <div style={{ background: '#fff', padding: 30, marginBottom: 10 }}>
        <PagerContainer>
          <PagerButton>Prev</PagerButton>
          <PagerButton>1</PagerButton>
          <PagerButtonSelect>
            <option>...</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
          </PagerButtonSelect>
          <PagerButton>5</PagerButton>
          <PagerButton>6</PagerButton>
          <PagerButton>7</PagerButton>
          <PagerButton>8</PagerButton>
          <PagerButton>9</PagerButton>
          <PagerButton $active>10</PagerButton>
          <PagerButton $disabled>Next</PagerButton>
        </PagerContainer>
      </div>
      <div style={{ background: '#fff', padding: 30, marginBottom: 10 }}>
        <PagerContainer>
          <PagerButton>Prev</PagerButton>
          <PagerButton>1</PagerButton>
          <PagerButtonSelect>
            <option>...</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
          </PagerButtonSelect>
          <PagerButton>8</PagerButton>
          <PagerButton>9</PagerButton>
          <PagerButton $active>10</PagerButton>
          <PagerButton>11</PagerButton>
          <PagerButton>12</PagerButton>
          <PagerButtonSelect>
            <option>...</option>
            <option>13</option>
            <option>14</option>
            <option>15</option>
            <option>16</option>
          </PagerButtonSelect>
          <PagerButton>17</PagerButton>
          <PagerButton>Next</PagerButton>
        </PagerContainer>
      </div>
      <div style={{ background: '#fff', padding: 30, marginBottom: 10 }}>
        <PagerContainer>Go to page [__] | [Prev] [1] [2] [3] [...] [10] [11] [12] [Next]</PagerContainer>
      </div>
      <div style={{ background: '#fff', padding: 30, marginBottom: 10, textAlign: 'left' }}>
        <ul>
          <li>The collapsed view would only appear after 8 pages and over</li>
          <li>Go to page would only appear at 12 pages and over.</li>
        </ul>
      </div>
    </div>
  );
};
