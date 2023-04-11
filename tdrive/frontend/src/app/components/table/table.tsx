/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import Languages from 'app/features/global/services/languages-service';
import Button from 'components/buttons/button.jsx';
import InputIcon from 'components/inputs/input-icon.jsx';
import './table.scss';

type Props = {
  column?: any;
  noHeader: boolean;
  onAdd: () => void;
  onRequestMore: (refresh: boolean) => Promise<any[]>;
  onSearch: (query: string, maxResults: number, callback: (res: any[]) => void) => Promise<any[]>;
  updatedData: (data: any) => any;
  addText?: string;
  resultsPerPage?: number;
  unFocused: boolean;
};
type State = {
  data: null | any[];
  searchResults: any[];
  loading: boolean;
  has_more: boolean;
  page: number;
  searching: boolean;
};

export default class Table extends Component<Props, State> {
  searchFieldValue = '';
  searchRunning = false;
  searchRunningTimeout: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      data: null,
      searchResults: [],
      loading: true,
      has_more: true,
      page: 0,
      searching: false,
    };
    Languages.addListener(this);
  }

  componentWillUnmount() {
    Languages.removeListener(this);
  }

  componentDidMount() {
    if (this.state.data === null) {
      this.requestMore(true);
    }
  }

  search() {
    if (this.searchFieldValue?.length <= 2) {
      return false;
    }
    if (this.searchRunning) {
      clearTimeout(this.searchRunningTimeout as number);
      this.searchRunningTimeout = window.setTimeout(() => {
        this.search();
      }, 1000);
      return;
    }

    this.setState({
      loading: true,
    });

    this.searchRunning = true;
    this.props.onSearch(this.searchFieldValue, 10, (data: any[]) => {
      this.searchRunning = false;
      this.setState({
        loading: false,
        searchResults: data,
      });
    });
  }

  renderItem(col: any, item: any) {
    if (col.render) {
      return col.render(item);
    } else {
      return <div className="">{col.dataIndex ? item[col.dataIndex] : ''}</div>;
    }
  }

  requestMore(refresh = false) {
    this.setState({ loading: true });
    this.props.onRequestMore(refresh).then(res => {
      const hasMore = res.length !== (this.state.data || []).length;
      this.setState({ loading: false, data: res, has_more: hasMore });
    });
  }

  setPosition() {
    if (!!this.props.onSearch && !this.props.onAdd) return 'flex-end';
    else return 'space-between';
  }

  nextPage() {
    this.setState({ page: this.state.page + 1 });
    if (this.getPageData().length < (this.state.page + 1) * this.getResultsPerPage()) {
      this.requestMore();
    }
  }

  getPageData() {
    const from = this.state.page * this.getResultsPerPage();
    return (this.state.data || []).slice(0, from + this.getResultsPerPage());
  }

  getResultsPerPage(): number {
    return this.props.resultsPerPage || 50;
  }

  render() {
    let page_data = this.state.searching ? this.state.searchResults : this.getPageData();
    page_data = page_data
      .map(data => {
        data = this.props.updatedData ? this.props.updatedData(data) : data;
        if (!data) {
          return false;
        }
        return data;
      })
      .filter(i => i);

    return (
      <div>
        <div
          className="small-y-margin full-width"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: this.setPosition(),
          }}
        >
          {this.props.onAdd && (
            <Button
              className="medium"
              value={this.props.addText || 'Add'}
              onClick={this.props.onAdd}
            />
          )}
          {!!this.props.onSearch && (
            <div>
              <InputIcon
                icon="search"
                small
                placeholder={Languages.t('components.listmanager.filter', [], 'Search')}
                onChange={(event: any) => {
                  const q = event.target.value;
                  this.searchFieldValue = q;
                  this.setState({ searching: q.length > 0 });
                  this.search();
                }}
              />
            </div>
          )}
        </div>

        <div
          className={
            'table ' +
            (this.props.unFocused ? 'unfocused ' : '') +
            (this.state.loading ? 'loading ' : '')
          }
        >
          {!this.props.noHeader && (
            <div className="headerTable">
              {this.props.column.map((col: any, i: number) => {
                return (
                  <div
                    key={i}
                    className="headerItem"
                    style={{
                      width: col.width || 'inherit',
                      flex: col.width ? 'inherit' : '1',
                      textAlign: (col.titleStyle || {}).textAlign,
                    }}
                  >
                    {col.title}
                  </div>
                );
              })}
            </div>
          )}
          <div className="contentTable">
            {(page_data || []).length === 0 && !this.state.loading && (
              <div className="tr" style={{ justifyContent: 'center', display: 'flex' }}>
                <div className="item" style={{ lineHeight: '32px' }}>
                  {Languages.t('components.user_picker.modal_no_result')}
                </div>
              </div>
            )}
            {(page_data || []).length === 0 &&
              !!this.state.loading &&
              Array(this.state.searching ? 1 : this.getResultsPerPage()).map((_, i: number) => {
                return (
                  <div key={i} className="tr">
                    <div className="item">
                      <div className="line"></div>
                    </div>
                  </div>
                );
              })}
            {(page_data || []).map((data: any, i: number) => {
              return (
                <div key={i} className="tr">
                  {this.props.column.map((col: any, j: number) => {
                    return (
                      <div
                        key={j}
                        className="item"
                        style={{ width: col.width || 'inherit', flex: col.width ? 'inherit' : '1' }}
                      >
                        {this.renderItem(col, data)}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          {!this.state.searching &&
            !!this.state.has_more &&
            page_data.length >= this.getResultsPerPage() && (
              <div className="footerTable">
                <a href="#" onClick={() => this.nextPage()}>
                  {Languages.t('components.searchpopup.load_more', [], 'Load more results')}
                </a>
              </div>
            )}
        </div>
      </div>
    );
  }
}
